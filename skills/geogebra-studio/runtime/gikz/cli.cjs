#!/usr/bin/env node
// Gikz — Clean GeoGebra TikZ exports into concise, readable LaTeX code
//
// Derived from GGB-Tikz-Code-Filter by By990920
// Original: https://github.com/By990920/GGB-Tikz-Code-Filter
//
// Copyright (C) 2026
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// (at your option) any later version.
//
// 用法:
//   node gikz.js [选项] <文件...>
//   cat export.txt | node gikz.js [选项]
//
// 选项:
//   --standalone, -s     输出完整 standalone LaTeX 文档
//   --tikzonly,   -t     仅输出 tikzpicture 片段（默认）
//   --no-points          不输出点标记
//   --no-labels          不输出点标签
//   --no-round           不四舍五入坐标
//   --output, -o <file>  输出到文件（批量时为目录）
//   --help, -h           显示帮助

'use strict';
const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');
const {cleanTikZCode,wrapStandalone,convertGeoGebraXML}=require('./core.cjs');
function readGGB(buf) {
    let eocdPos = -1;
    for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
        if (buf.readUInt32LE(i) === 0x06054b50) { eocdPos = i; break; }
    }
    if (eocdPos === -1) throw new Error('无效的 GGB 文件（非 ZIP 格式）');

    const cdEntries = buf.readUInt16LE(eocdPos + 10);
    const cdOffset = buf.readUInt32LE(eocdPos + 16);
    let pos = cdOffset;
    for (let i = 0; i < cdEntries; i++) {
        if (pos + 46 > buf.length || buf.readUInt32LE(pos) !== 0x02014b50) break;
        const method   = buf.readUInt16LE(pos + 10);
        const cSize    = buf.readUInt32LE(pos + 20);
        const nameLen  = buf.readUInt16LE(pos + 28);
        const extraLen = buf.readUInt16LE(pos + 30);
        const cmtLen   = buf.readUInt16LE(pos + 32);
        const locOff   = buf.readUInt32LE(pos + 42);
        const name     = buf.toString('utf8', pos + 46, pos + 46 + nameLen);
        if (name === 'geogebra.xml') {
            const lnLen = buf.readUInt16LE(locOff + 26);
            const leLen = buf.readUInt16LE(locOff + 28);
            const data  = buf.slice(locOff + 30 + lnLen + leLen, locOff + 30 + lnLen + leLen + cSize);
            if (method === 0) return data.toString('utf8');
            if (method === 8) return zlib.inflateRawSync(data).toString('utf8');
            throw new Error(`GGB: 不支持的压缩方法 ${method}`);
        }
        pos += 46 + nameLen + extraLen + cmtLen;
    }
    throw new Error('GGB 文件中未找到 geogebra.xml');
}

function printHelp() {
    console.log(`
Gikz — GeoGebra TikZ 代码清洗工具

用法:
  node gikz.js [选项] <文件...>
  cat export.txt | node gikz.js [选项]

支持的输入格式:
  .txt/.tex    GeoGebra TikZ 导出文件（清洗模式）
  .ggb         GeoGebra 工程文件（直接转换）
  .xml         GeoGebra XML 文件（直接转换）

选项:
  --standalone, -s      输出完整 standalone LaTeX 文档
  --tikzonly,   -t      仅输出 tikzpicture 片段（默认）
  --no-points           不输出点标记
  --no-labels           不输出点标签
  --no-round            不四舍五入坐标（保留原始精度）
  --output, -o <path>   输出到文件（多文件时为目录）
  --help, -h            显示此帮助

示例:
  node gikz.js export.txt
  node gikz.js figure.ggb
  node gikz.js -s -o clean.tex export.txt
  node gikz.js *.txt -o output/
  cat export.txt | node gikz.js -s
`);
}

function parseArgs(argv) {
    const args = argv.slice(2);
    const opts = { standalone: false, points: true, labels: true, round: true, output: null, files: [] };

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--standalone': case '-s': opts.standalone = true; break;
            case '--tikzonly':   case '-t': opts.standalone = false; break;
            case '--no-points':  opts.points = false; break;
            case '--no-labels':  opts.labels = false; break;
            case '--no-round':   opts.round  = false; break;
            case '--output': case '-o':
                opts.output = args[++i]; break;
            case '--help': case '-h':
                printHelp(); process.exit(0);
            default:
                if (args[i].startsWith('-')) { console.error(`未知选项: ${args[i]}`); process.exit(1); }
                opts.files.push(args[i]);
        }
    }
    return opts;
}

function processContent(content, opts) {
    let tikz;
    if (Buffer.isBuffer(content)) {
        const xml = readGGB(content);
        tikz = convertGeoGebraXML(xml, opts);
    } else if (content.includes('<geogebra') && content.includes('<construction')) {
        tikz = convertGeoGebraXML(content, opts);
    } else {
        tikz = cleanTikZCode(content, opts);
    }
    if (opts.standalone) tikz = wrapStandalone(tikz);
    return tikz;
}

function main() {
    const opts = parseArgs(process.argv);
    const isTTY = process.stdin.isTTY;

    if (opts.files.length === 0 && isTTY) {
        printHelp();
        process.exit(0);
    }

    // stdin 模式
    if (opts.files.length === 0) {
        let data = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', chunk => data += chunk);
        process.stdin.on('end', () => {
            try {
                const result = processContent(data, opts);
                if (opts.output) {
                    fs.writeFileSync(opts.output, result, 'utf8');
                    console.error(`✔ 已写入 ${opts.output}`);
                } else {
                    process.stdout.write(result + '\n');
                }
            } catch (e) {
                console.error(`✘ 错误: ${e.message}`);
                process.exit(1);
            }
        });
        return;
    }

    // 文件模式
    const isDir = opts.output && opts.files.length > 1;
    if (isDir && !fs.existsSync(opts.output)) fs.mkdirSync(opts.output, { recursive: true });

    let ok = 0, fail = 0;
    for (const file of opts.files) {
        try {
            const ext = path.extname(file).toLowerCase();
            const content = ext === '.ggb' ? fs.readFileSync(file) : fs.readFileSync(file, 'utf8');
            const result = processContent(content, opts);

            if (opts.output) {
                const outPath = isDir
                    ? path.join(opts.output, path.basename(file, path.extname(file)) + '.tex')
                    : opts.output;
                fs.writeFileSync(outPath, result, 'utf8');
                console.error(`✔ ${file} → ${outPath}`);
            } else {
                if (opts.files.length > 1) console.log(`% === ${file} ===`);
                process.stdout.write(result + '\n');
            }
            ok++;
        } catch (e) {
            console.error(`✘ ${file}: ${e.message}`);
            fail++;
        }
    }

    if (opts.files.length > 1) console.error(`\n完成: ${ok} 成功, ${fail} 失败`);
    if (fail > 0) process.exit(1);
}

module.exports = {processContent, readGGB};
if(require.main===module)main();
