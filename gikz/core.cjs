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

function roundToThreeDecimals(num) {
    return Math.round(num * 1000) / 1000;
}

function formatCoordinate(coordStr, shouldRound) {
    const match = coordStr.match(/\(([^,]+),([^)]+)\)/);
    if (!match) return coordStr;
    let x = parseFloat(match[1]);
    let y = parseFloat(match[2]);
    if (shouldRound) {
        x = roundToThreeDecimals(x);
        y = roundToThreeDecimals(y);
    }
    return `(${x},${y})`;
}

function getSmartLabelPosition(x, y, allPoints) {
    const xCoords = allPoints.map(p => p.x);
    const yCoords = allPoints.map(p => p.y);
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    let position = 'above';
    if (Math.abs(x - minX) < 0.1) {
        position = 'left';
    } else if (Math.abs(x - maxX) < 0.1) {
        position = 'right';
    } else if (Math.abs(y - minY) < 0.1) {
        position = 'below';
    } else if (Math.abs(y - maxY) < 0.1) {
        position = 'above';
    } else {
        if (x > centerX && y > centerY) position = 'above right';
        else if (x > centerX && y <= centerY) position = 'below right';
        else if (x <= centerX && y > centerY) position = 'above left';
        else position = 'below left';
    }
    return position;
}

const convertLineStyle = (style) => {
    if (!style) return '';
    let lineStyle = style.replace(/line width=[^,\]]+,?/g, '');
    lineStyle = lineStyle.replace(/,\s*$/g, '');
    lineStyle = lineStyle.replace(/\[\s*,\s*/g, '[');
    if (lineStyle.includes('dash pattern=on 1pt off 1pt on 1pt off 4pt')) return 'dash dot';
    if (lineStyle.includes('dash pattern=on 1pt off 1pt')) return 'dashed';
    if (lineStyle.includes('dotted')) return 'dotted';
    if (lineStyle.includes('dash')) return 'dashed';
    return '';
};

// ─── 提取函数 ───────────────────────────────────────────

function extractQuadraticFunctions(code, shouldRound) {
    try {
        const quadraticRegex = /\\draw\s*\[([^\]]+)\]\s*plot\s*\(\\x,\{\(\\x\)\^2\/2\/([^}]+)\}\)/g;
        const quadraticMatches = [...code.matchAll(quadraticRegex)];
        const quadraticFunctions = [];

        quadraticMatches.forEach(match => {
            const options = match[1];
            let denominator = match[2];

            const samplesMatch = options.match(/samples=(\d+)/);
            const rotateMatch = options.match(/rotate around=\{([^:]+):\(([^,]+),([^)]+)\)\}/);
            const xshiftMatch = options.match(/xshift=([^,]+)cm/);
            const yshiftMatch = options.match(/yshift=([^,]+)cm/);
            const domainMatch = options.match(/domain=([^:)]+):([^)]+)\)?/);

            if (domainMatch) {
                let angle = "0", centerX = "0", centerY = "0";
                if (rotateMatch) { angle = rotateMatch[1]; centerX = rotateMatch[2]; centerY = rotateMatch[3]; }
                let xshift = "0", yshift = "0";
                if (xshiftMatch) xshift = xshiftMatch[1];
                if (yshiftMatch) yshift = yshiftMatch[1];
                let domainStart = domainMatch[1];
                let domainEnd = domainMatch[2];
                if (domainEnd.includes(')')) domainEnd = domainEnd.replace(')', '');

                if (shouldRound) {
                    if (centerX !== "0") centerX = roundToThreeDecimals(parseFloat(centerX));
                    if (centerY !== "0") centerY = roundToThreeDecimals(parseFloat(centerY));
                    if (xshift !== "0") xshift = roundToThreeDecimals(parseFloat(xshift));
                    if (yshift !== "0") yshift = roundToThreeDecimals(parseFloat(yshift));
                    denominator = roundToThreeDecimals(parseFloat(denominator));
                    domainStart = roundToThreeDecimals(parseFloat(domainStart));
                    domainEnd = roundToThreeDecimals(parseFloat(domainEnd));
                    xshift += 'cm'; yshift += 'cm';
                }

                let newOptions = 'smooth,samples=500';
                if (rotateMatch) newOptions += `,rotate around={${angle}:(${centerX},${centerY})}`;
                if ((xshiftMatch && xshift !== "0cm") || (yshiftMatch && yshift !== "0cm"))
                    newOptions += `,xshift=${xshift},yshift=${yshift}`;
                newOptions += `,domain=${domainStart}:${domainEnd}`;

                quadraticFunctions.push({ original: match[0], options: newOptions, expression: `(\\x)^2/2/${denominator}` });
            }
        });
        return { hasQuadratic: quadraticFunctions.length > 0, quadraticFunctions };
    } catch (error) {
        return { hasQuadratic: false, quadraticFunctions: [] };
    }
}

function extractFunctionPlots(code, shouldRound) {
    try {
        const clipRegex = /\\clip\(([^,]+),([^)]+)\)\s*rectangle\s*\(([^,]+),([^)]+)\);/;
        const clipMatch = code.match(clipRegex);
        if (!clipMatch) {
            return { hasFunctions: false, scopeCode: '', clipArea: '', normalFunctionCount: 0, quadraticFunctionCount: 0 };
        }

        const clipX1 = shouldRound ? roundToThreeDecimals(parseFloat(clipMatch[1])) : parseFloat(clipMatch[1]);
        const clipY1 = shouldRound ? roundToThreeDecimals(parseFloat(clipMatch[2])) : parseFloat(clipMatch[2]);
        const clipX2 = shouldRound ? roundToThreeDecimals(parseFloat(clipMatch[3])) : parseFloat(clipMatch[3]);
        const clipY2 = shouldRound ? roundToThreeDecimals(parseFloat(clipMatch[4])) : parseFloat(clipMatch[4]);

        const functionPlotRegex = /\\draw\[([^\]]*)\]\s*plot\s*\(\\x,\{([^}]*)\}\)/g;
        const functionMatches = [...code.matchAll(functionPlotRegex)];
        const functions = [];
        const containsLnRegex = /ln\s*\(/i;

        functionMatches.forEach(match => {
            const options = match[1];
            const functionExpression = match[2];
            const domainRegex = /domain=([^:]+):([^,\]]+)/;
            const domainMatch = options.match(domainRegex);

            if (domainMatch) {
                let domainStart = domainMatch[1], domainEnd = domainMatch[2];
                if (containsLnRegex.test(functionExpression)) {
                    if (Math.abs(parseFloat(domainStart)) < 0.001) domainStart = '0.001';
                }
                if (shouldRound) {
                    const s = parseFloat(domainStart), e = parseFloat(domainEnd);
                    if (!isNaN(s)) domainStart = roundToThreeDecimals(s).toString();
                    if (!isNaN(e)) domainEnd = roundToThreeDecimals(e).toString();
                }
                let lineStyle = '';
                if (options.includes('dash pattern=on 1pt off 1pt on 1pt off 4pt')) lineStyle = 'dash dot';
                else if (options.includes('dash pattern=on 1pt off 1pt')) lineStyle = 'dashed';
                else if (options.includes('dotted')) lineStyle = 'dotted';

                let newOptions = 'smooth,samples=500';
                if (lineStyle) newOptions = lineStyle + ',' + newOptions;

                functions.push({ original: match[0], options: newOptions, domainStart, domainEnd, expression: functionExpression, lineStyle });
            }
        });

        const quadraticResult = extractQuadraticFunctions(code, shouldRound);
        let result = '  \\begin{scope}\n';
        result += `    \\clip(${clipX1},${clipY1}) rectangle (${clipX2},${clipY2});\n`;
        functions.forEach(func => {
            result += `    \\draw[${func.options},domain=${func.domainStart}:${func.domainEnd}] plot(\\x,{${func.expression}});\n`;
        });
        if (quadraticResult.hasQuadratic) {
            quadraticResult.quadraticFunctions.forEach(quad => {
                result += `    \\draw[${quad.options}] plot(\\x,{${quad.expression}});\n`;
            });
        }
        result += '  \\end{scope}\n';

        return {
            hasFunctions: functions.length > 0 || quadraticResult.hasQuadratic,
            scopeCode: result,
            clipArea: `(${clipX1},${clipY1}) rectangle (${clipX2},${clipY2})`,
            normalFunctionCount: functions.length,
            quadraticFunctionCount: quadraticResult.quadraticFunctions.length
        };
    } catch (error) {
        return { hasFunctions: false, scopeCode: '', clipArea: '', normalFunctionCount: 0, quadraticFunctionCount: 0 };
    }
}

function extractParametricPlots(code, shouldRound) {
    try {
        const parametricRegex = /\\draw\[([^\]]*)\]\s*plot\[parametric\]\s*function\{([^}]+)\};/g;
        const matches = [...code.matchAll(parametricRegex)];
        const plots = [];

        matches.forEach(match => {
            const options = match[1];
            const functionStr = match[2];
            const commaMatch = functionStr.match(/([^,]+),([^,]+)/);
            if (!commaMatch) return;
            let xExpr = commaMatch[1].trim(), yExpr = commaMatch[2].trim();

            if (shouldRound) {
                xExpr = xExpr.replace(/(\d+\.\d{4,})/g, m => roundToThreeDecimals(parseFloat(m)).toString());
                yExpr = yExpr.replace(/(\d+\.\d{4,})/g, m => roundToThreeDecimals(parseFloat(m)).toString());
            }
            xExpr = xExpr.replace(/t\*\*\((\d+)\)/g, '\\t^$1');
            xExpr = xExpr.replace(/\(1-t\)\*\*\((\d+)\)/g, '(1-\\t)^$1');
            yExpr = yExpr.replace(/t\*\*\((\d+)\)/g, '\\t^$1');
            yExpr = yExpr.replace(/\(1-t\)\*\*\((\d+)\)/g, '(1-\\t)^$1');
            xExpr = xExpr.replace(/([ (+\-*/,])t(?!\w)/g, '$1\\t');
            yExpr = yExpr.replace(/([ (+\-*/,])t(?!\w)/g, '$1\\t');
            xExpr = xExpr.replace(/^t(?!\w)/, '\\t');
            yExpr = yExpr.replace(/^t(?!\w)/, '\\t');

            const lineStyle = convertLineStyle(options);
            plots.push({ original: match[0], options, xExpression: xExpr, yExpression: yExpr, lineStyle });
        });
        return { hasParametricPlots: plots.length > 0, plots };
    } catch (error) {
        return { hasParametricPlots: false, plots: [] };
    }
}

// ─── 主清洗函数 ──────────────────────────────────────────

function cleanTikZCode(code, opts = {}) {
    code = code.replace(/\\draw\s+\[/g, '\\\\draw[');
    const shouldRound    = opts.round   !== false;
    const includePoints  = opts.points  !== false;
    const includeLabels  = opts.labels  !== false;

    const tikzMatch = code.match(/\\begin\{tikzpicture\}([\s\S]*?)\\end\{tikzpicture\}/);
    if (!tikzMatch) throw new Error('未找到 tikzpicture 环境');

    // 点
    const pointRegex = /\\draw\s*\[fill=[^\]]+\]\s*\(([^)]+)\)\s*circle\s*\(([^)]+)\);/g;
    const nodeRegex  = /\\draw\[color=[^\]]+\]\s*\([^)]+\)\s*node\s*\{\$(?!.*\\textrm\{\\degre\})([^$]+(?:\{[^}]*\})?[^$]*)\$\}/g;
    const pointMap = new Map();
    const pointMatches = [...code.matchAll(pointRegex)];
    const nodeMatches  = [...code.matchAll(nodeRegex)];

    // Modern GeoGebra exports LaTeX Text objects as anchored nodes. Parse each
    // complete line so nested math braces (e.g. mathit{A}) are preserved.
    const anchoredNodes = [...code.matchAll(/\\draw\s*(?:\[[^\]]*\])?\s*\(([^)]+)\)\s*node\s*\[([^\]]+)\]\s*\{([^\r\n]*)\};/g)];
    const usedAnchoredNodes = new Set();
    const allPoints = [];
    pointMatches.forEach(match => {
        const coords = match[1];
        const formattedCoords = formatCoordinate(`(${coords})`, shouldRound);
        allPoints.push({ original: coords, formatted: formattedCoords.slice(1, -1) });
    });
    allPoints.forEach((point, index) => {
        const [x, y] = point.original.split(',').map(Number);
        const candidates = anchoredNodes.map((node, i) => {
            const label = node[3].match(/^\$\\mathit\{([A-Za-z][A-Za-z0-9_]*)\}\$$/)?.[1]
                || node[3].match(/^\$([A-Za-z][A-Za-z0-9_]*)\$$/)?.[1];
            const [nx, ny] = node[1].split(',').map(Number);
            return { i, label, distance: Math.hypot(nx-x, ny-y) };
        }).filter(n => n.label && !usedAnchoredNodes.has(n.i)).sort((a,b) => a.distance-b.distance);
        if (candidates.length && candidates[0].distance < 1) {
            pointMap.set(candidates[0].label, point.formatted);
            usedAnchoredNodes.add(candidates[0].i);
        } else if (index < nodeMatches.length) {
            pointMap.set(nodeMatches[index][1], point.formatted);
        } else {
            // Unlabelled points still need their visible marker.
            pointMap.set(`gikzPoint${index}`, point.formatted);
        }
    });

    // 函数
    const functionPlotsResult = extractFunctionPlots(code, shouldRound);
    // 贝塞尔
    const parametricPlotResult = extractParametricPlots(code, shouldRound);

    // 文本标签
    const textLabels = anchoredNodes.filter((_, i) => !usedAnchoredNodes.has(i)).map(match => ({
        coords: formatCoordinate(`(${match[1]})`, shouldRound), options: match[2], content: match[3]
    }));

    // 角度标签
    const angleLabelRegex = /\\draw\[color=([^\]]+)\]\s*\(([^)]+)\)\s*node\s*\{\$([^}]+)\\textrm\{\\degre\}\$\};/g;
    const angleLabelMatches = [...code.matchAll(angleLabelRegex)];
    const angleLabels = [];
    angleLabelMatches.forEach(match => {
        angleLabels.push({
            color: match[1],
            coords: formatCoordinate(`(${match[2]})`, shouldRound),
            content: match[3]
        });
    });

    // 线段
    const lineRegex = /\\draw\s*(\[[^\]]+\])?\s*\(([^)]+)\)\s*--\s*\(([^)]+)\);/g;
    const lineMatches = [...code.matchAll(lineRegex)];

    // 圆
    const circleRegex = /\\draw\s*\[([^\]]*line[^\]]*)\]\s*\(([^)]+)\)\s*circle\s*\(([^)]+)\);/g;
    const circleMatches = [...code.matchAll(circleRegex)];
    const circles = [];
    circleMatches.forEach(match => {
        const options = match[1];
        const centerCoords = match[2];
        const radius = match[3];
        const formattedCenter = formatCoordinate(`(${centerCoords})`, shouldRound);
        const lineStyle = convertLineStyle(options);
        let centerLabel = null;
        for (const [label, coords] of pointMap) {
            const coordStr = coords.includes('(') ? coords : `(${coords})`;
            if (coordStr.includes(centerCoords.trim()) || formattedCenter.includes(coords)) {
                centerLabel = label; break;
            }
        }
        circles.push({
            center: centerLabel ? `(${centerLabel})` : formattedCenter,
            radius: shouldRound ? roundToThreeDecimals(parseFloat(radius)) + (radius.includes('cm') ? 'cm' : '') : radius,
            lineStyle
        });
    });

    // 圆弧
    const arcRegex = /\\draw\s*(\[[^\]]*\])?\s*plot\[domain=([^:]+):([^,]+),variable=\\t\]\(\{1\*([^\*]+)\*cos\(\\t r\)\+0\*[^\*]+\*sin\(\\t r\)\},\{0\*[^\*]+\*cos\(\\t r\)\+1\*[^\*]+\*sin\(\\t r\)\}\);/g;
    const arcMatches = [...code.matchAll(arcRegex)];
    const arcs = [];
    arcMatches.forEach(match => {
        const style = match[1] || '';
        const rv = (val) => shouldRound ? roundToThreeDecimals(parseFloat(val)) : val;

        let lineStyle = '';
        if (style.includes('dash pattern=on 1pt off 1pt on 1pt off 4pt')) lineStyle = 'dash dot';
        else if (style.includes('dash pattern=on 1pt off 1pt')) lineStyle = 'dashed';
        else if (style.includes('dotted')) lineStyle = 'dotted';

        const shiftRegex = /shift=\{\(([^,]+),([^)]+)\)\}/;
        const shiftMatch = style.match(shiftRegex);
        let styleParts = [];
        if (lineStyle) styleParts.push(lineStyle);
        if (shiftMatch) styleParts.push(`shift={(${rv(shiftMatch[1])},${rv(shiftMatch[2])})}`);
        styleParts.push('smooth');
        let newStyle = styleParts.length > 0 ? '[' + styleParts.join(', ') + ']' : '';

        arcs.push({ style: newStyle, startAngle: rv(match[2]), endAngle: rv(match[3]), radius: rv(match[4]) });
    });

    // 扇形
    const sectorRegex = /\\draw\s*\[shift=\{\(([^,]+),([^)]+)\)\}[^\]]*\]\s*\(0,0\)\s*--\s*plot\[domain=([^:]+):([^,\]]+),variable=\\t\]\(\{1\*([^\*]+)\*cos\(\\t r\)\+0\*[^\*]+\*sin\(\\t r\)\},\{0\*[^\*]+\*cos\(\\t r\)\+1\*[^\*]+\*sin\(\\t r\)\}\)\s*--\s*cycle\s*;/g;
    const sectorMatches = [...code.matchAll(sectorRegex)];
    const sectors = [];
    sectorMatches.forEach(match => {
        const rv = (val) => shouldRound ? roundToThreeDecimals(parseFloat(val)) : val;
        const style = match[0].match(/\\draw\s*\[([^\]]+)\]/)[1];
        sectors.push({
            shiftX: rv(match[1].trim()), shiftY: rv(match[2].trim()),
            startAngle: rv(match[3].trim()), endAngle: rv(match[4].trim()),
            radius: rv(match[5].trim()), lineStyle: convertLineStyle(style)
        });
    });

    // 椭圆
    const ellipseRegex = /\\draw\s*\[([^\]]*)\]\s*\(([^)]+)\)\s*ellipse\s*\(([^)]+)\);/g;
    const ellipseMatches = [...code.matchAll(ellipseRegex)];
    const ellipses = [];
    ellipseMatches.forEach(match => {
        const options = match[1], centerCoords = match[2], radii = match[3];
        const radiusParts = radii.split(' and ');
        let xR = radiusParts[0]?.trim() || '', yR = radiusParts[1]?.trim() || '';
        const formattedCenter = formatCoordinate(`(${centerCoords})`, shouldRound);
        let centerLabel = null;
        for (const [label, coords] of pointMap) {
            const cs = coords.includes('(') ? coords : `(${coords})`;
            if (cs.includes(centerCoords.trim()) || formattedCenter.includes(coords)) { centerLabel = label; break; }
        }
        let rotationAngle = 0, rotationCenter = null;
        const rotateMatch = options.match(/rotate around=\{([^:]+):\(([^)]+)\)\}/);
        if (rotateMatch) {
            rotationAngle = parseFloat(rotateMatch[1]);
            if (shouldRound) rotationAngle = roundToThreeDecimals(rotationAngle);
            const rc = rotateMatch[2];
            const frc = formatCoordinate(`(${rc})`, shouldRound);
            for (const [label, coords] of pointMap) {
                const cs = coords.includes('(') ? coords : `(${coords})`;
                if (cs.includes(rc.trim()) || frc.includes(coords)) { rotationCenter = label; break; }
            }
            if (!rotationCenter) rotationCenter = frc;
        }
        const lineStyle = convertLineStyle(options);
        if (shouldRound && xR && yR) {
            const xU = xR.replace(/[0-9.\-\s]/g, ''), yU = yR.replace(/[0-9.\-\s]/g, '');
            xR = roundToThreeDecimals(parseFloat(xR)) + xU;
            yR = roundToThreeDecimals(parseFloat(yR)) + yU;
        }
        const obj = { center: centerLabel ? `(${centerLabel})` : formattedCenter, xRadius: xR, yRadius: yR, lineStyle, hasRotation: !!rotateMatch };
        if (rotateMatch) { obj.rotationAngle = rotationAngle; obj.rotationCenter = rotationCenter ? `(${rotationCenter})` : formattedCenter; }
        ellipses.push(obj);
    });

    // 角度标记
    const angleRegex = /\\draw\s*\[shift=\{\(([^,]+),([^)]+)\)\}[^\]]*\]\s*\(0,0\)\s*--\s*\(([^:]+):([^)]+)\)\s*arc\s*\(([^:]+):([^)]+):([^)]+)\)\s*--\s*cycle;/g;
    const angleMatches = [...code.matchAll(angleRegex)];
    const angles = [];
    angleMatches.forEach(match => {
        const cX = match[1].trim(), cY = match[2].trim();
        const formattedCenter = formatCoordinate(`(${cX},${cY})`, shouldRound);
        let centerLabel = null;
        for (const [label, coords] of pointMap) {
            const cs = coords.includes('(') ? coords : `(${coords})`;
            if (cs.includes(`${cX},${cY}`) || formattedCenter.includes(coords)) { centerLabel = label; break; }
        }
        const rv = (v) => shouldRound ? roundToThreeDecimals(parseFloat(v)) : v;
        angles.push({
            center: centerLabel ? `(${centerLabel})` : formattedCenter,
            startAngle: rv(match[3].trim()), endAngle: rv(match[6].trim()), radius: rv(match[4].trim())
        });
    });

    // ─── 组装输出 ────────────────────────────────────────
    let result = '\\begin{tikzpicture}[scale=1]\n';

    if (pointMap.size > 0) {
        result += '  % 坐标点定义\n';
        for (const [label, coords] of pointMap) {
            result += `  \\coordinate (${label}) at ${coords.includes('(') ? coords : `(${coords})`};\n`;
        }
        result += '\n';
    }

    if (functionPlotsResult.hasFunctions) {
        result += '  % 函数图像\n' + functionPlotsResult.scopeCode + '\n';
    }

    if (parametricPlotResult.hasParametricPlots) {
        result += '  % 贝塞尔曲线\n';
        parametricPlotResult.plots.forEach(plot => {
            const ls = plot.lineStyle ? `[${plot.lineStyle}, smooth, samples=100, domain=0:1, variable=\\t]` : '[smooth, samples=100, domain=0:1, variable=\\t]';
            result += `  \\draw${ls} plot\n    ({${plot.xExpression}},\n     {${plot.yExpression}});\n\n`;
        });
    }

    if (lineMatches.length > 0 || circles.length > 0 || arcs.length > 0 || ellipses.length > 0 || angles.length > 0 || angleLabels.length > 0 || sectors.length > 0) {
        result += '  % 几何元素\n';

        if (angles.length > 0) {
            result += '  % 角度\n';
            angles.forEach(a => {
                result += `  \\fill [shift=${a.center}, gray!30] (0,0) -- (${a.startAngle}:${a.radius}) arc (${a.startAngle}:${a.endAngle}:${a.radius}) -- cycle;\n`;
            });
            result += '\n';
        }

        if (sectors.length > 0) {
            result += '  % 扇形绘制\n';
            sectors.forEach(s => {
                const st = s.lineStyle ? `[${s.lineStyle}]` : '';
                result += `  \\draw${st} [shift={(${s.shiftX},${s.shiftY})}] (0,0) -- plot[domain=${s.startAngle}:${s.endAngle}]({1*${s.radius}*cos(\\x r)+0*${s.radius}*sin(\\x r)},{0*${s.radius}*cos(\\x r)+1*${s.radius}*sin(\\x r)}) -- cycle;\n`;
            });
            if (lineMatches.length > 0) result += '\n';
        }

        if (circles.length > 0) {
            circles.forEach(c => {
                result += c.lineStyle
                    ? `  \\draw[${c.lineStyle}] ${c.center} circle (${c.radius});\n`
                    : `  \\draw ${c.center} circle (${c.radius});\n`;
            });
            if (lineMatches.length > 0 || arcs.length > 0) result += '\n';
        }

        if (ellipses.length > 0) {
            result += '  % 椭圆\n';
            ellipses.forEach(e => {
                const drawOpts = [];
                if (e.lineStyle) drawOpts.push(e.lineStyle);
                if (e.hasRotation) drawOpts.push(`rotate around={${e.rotationAngle}:${e.rotationCenter}}`);
                result += drawOpts.length > 0
                    ? `  \\draw[${drawOpts.join(', ')}] ${e.center} ellipse (${e.xRadius} and ${e.yRadius});\n`
                    : `  \\draw ${e.center} ellipse (${e.xRadius} and ${e.yRadius});\n`;
            });
            if (lineMatches.length > 0 || arcs.length > 0) result += '\n';
        }

        if (arcs.length > 0) {
            result += '  % 圆弧绘制\n';
            arcs.forEach(arc => {
                const s = arc.style.trim() ? arc.style : '';
                result += `  \\draw${s} plot[domain=${arc.startAngle}:${arc.endAngle}]({1*${arc.radius}*cos(\\x r)+0*${arc.radius}*sin(\\x r)},{0*${arc.radius}*cos(\\x r)+1*${arc.radius}*sin(\\x r)});\n`;
            });
            if (lineMatches.length > 0) result += '\n';
        }

        const processedLines = new Set();
        const parseCoords = (str) => {
            const m = str.match(/\(([^,]+),([^)]+)\)/);
            return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : null;
        };

        lineMatches.forEach(match => {
            const style = match[1] || '';
            const coord1 = match[2], coord2 = match[3];
            const convertedStyle = convertLineStyle(style);
            let label1 = null, label2 = null;
            const tc1 = formatCoordinate(`(${coord1})`, shouldRound);
            const tc2 = formatCoordinate(`(${coord2})`, shouldRound);
            const t1 = parseCoords(tc1), t2 = parseCoords(tc2);

            for (const [label, coords] of pointMap) {
                const pcs = coords.includes('(') ? coords : `(${coords})`;
                const p = parseCoords(pcs);
                if (p && t1 && Math.abs(p.x - t1.x) < 0.001 && Math.abs(p.y - t1.y) < 0.001) label1 = label;
                if (p && t2 && Math.abs(p.x - t2.x) < 0.001 && Math.abs(p.y - t2.y) < 0.001) label2 = label;
            }

            if (label1 && label2) {
                const key = `${label1}-${label2}`, rev = `${label2}-${label1}`;
                if (!processedLines.has(key) && !processedLines.has(rev)) {
                    result += convertedStyle ? `  \\draw[${convertedStyle}] (${label1}) -- (${label2});\n` : `  \\draw (${label1}) -- (${label2});\n`;
                    processedLines.add(key);
                }
            } else {
                const fc1 = formatCoordinate(`(${coord1})`, shouldRound);
                const fc2 = formatCoordinate(`(${coord2})`, shouldRound);
                result += convertedStyle ? `  \\draw[${convertedStyle}] ${fc1} -- ${fc2};\n` : `  \\draw ${fc1} -- ${fc2};\n`;
            }
        });
    }

    if (includePoints && pointMap.size > 0) {
        result += '\n  % 点标记\n';
        for (const [label] of pointMap) {
            result += `  \\draw[fill=black] (${label}) circle (1pt);\n`;
        }
    }

    if (includeLabels && pointMap.size > 0) {
        result += '\n  % 点标签\n';
        const allPointsData = [];
        for (const [label, coords] of pointMap) {
            const m = coords.match(/\(?([^,]+),([^)]+)\)?/);
            if (m) allPointsData.push({ label, x: parseFloat(m[1]), y: parseFloat(m[2]) });
        }
        for (const point of allPointsData) {
            if (/^gikzPoint\d+$/.test(point.label)) continue;
            const pos = getSmartLabelPosition(point.x, point.y, allPointsData);
            result += `  \\node [${pos}] at (${point.label}) {$${point.label}$};\n`;
        }
    }

    if (angleLabels.length > 0) {
        result += '\n  % 角度标签\n';
        angleLabels.forEach(l => { result += `  \\draw ${l.coords} node {$${l.content}^{\\circ}$};\n`; });
    }

    if (textLabels.length > 0) {
        result += '\n  % 文本标签\n';
        textLabels.forEach(l => { result += `  \\draw ${l.coords} node[${l.options}] {${l.content}};\n`; });
    }

    result += '\\end{tikzpicture}';
    return result;
}

// ─── GeoGebra XML/GGB 转换 ──────────────────────────────

function convertGeoGebraXML(xmlStr, opts = {}) {
    const shouldRound   = opts.round  !== false;
    const includePoints = opts.points !== false;
    const includeLabels = opts.labels !== false;
    const rv = v => shouldRound ? roundToThreeDecimals(v) : v;
    const de = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<')
                     .replace(/&gt;/g, '>').replace(/&apos;/g, "'").replace(/&quot;/g, '"');

    const constrM = xmlStr.match(/<construction[^>]*>([\s\S]*?)<\/construction>/);
    if (!constrM) throw new Error('XML 中未找到 construction 块');
    const constr = constrM[1];

    // 解析元素
    const elements = new Map();
    const elRe = /<element\s+type="([^"]+)"\s+label="([^"]+)">([\s\S]*?)<\/element>/g;
    let m;
    while ((m = elRe.exec(constr))) {
        const label = de(m[2]), body = m[3];
        const el = { type: m[1], label };

        const showM = body.match(/<show\s+object="([^"]+)"\s+label="([^"]+)"/);
        el.visible   = showM ? showM[1] === 'true' : false;
        el.showLabel = showM ? showM[2] === 'true' : false;

        const coordsM = body.match(/<coords\s+x="([^"]+)"\s+y="([^"]+)"\s+z="([^"]+)"/);
        if (coordsM) {
            const z = parseFloat(coordsM[3]) || 1;
            el.x = parseFloat(coordsM[1]) / z;
            el.y = parseFloat(coordsM[2]) / z;
        }

        const valM = body.match(/<value\s+val="([^"]+)"/);
        if (valM) el.value = parseFloat(valM[1]);
        const arcM = body.match(/<arcSize\s+val="([^"]+)"/);
        if (arcM) el.arcSize = parseInt(arcM[1]);

        const colM = body.match(/<objColor[^>]+alpha="([^"]+)"/);
        if (colM) el.alpha = parseFloat(colM[1]);

        const lineM = body.match(/<lineStyle\s+thickness="([^"]+)"\s+type="([^"]+)"/);
        if (lineM) { el.lineThickness = parseInt(lineM[1]); el.lineType = parseInt(lineM[2]); }

        if (el.x !== undefined && (isNaN(el.x) || isNaN(el.y))) continue;
        elements.set(label, el);
    }

    // 解析命令
    const commands = [];
    const cmdRe = /<command\s+name="([^"]+)">([\s\S]*?)<\/command>/g;
    while ((m = cmdRe.exec(constr))) {
        const cmd = { name: m[1], inputs: [], outputs: [] };
        const inM = m[2].match(/<input\s+([^/]*)\/>/);
        if (inM) { const r = /a(\d+)="([^"]+)"/g; let a; while ((a = r.exec(inM[1]))) cmd.inputs[+a[1]] = de(a[2]); }
        const outM = m[2].match(/<output\s+([^/]*)\/>/);
        if (outM) { const r = /a(\d+)="([^"]+)"/g; let a; while ((a = r.exec(outM[1]))) cmd.outputs[+a[1]] = de(a[2]); }
        commands.push(cmd);
    }

    const cmdByOut = new Map();
    for (const cmd of commands)
        for (const lbl of cmd.outputs) if (lbl) cmdByOut.set(lbl, cmd);

    // 多边形边标签（排除独立绘制）
    const polyEdges = new Set();
    for (const cmd of commands) {
        if (cmd.name === 'Polygon')
            for (let i = 1; i < cmd.outputs.length; i++) if (cmd.outputs[i]) polyEdges.add(cmd.outputs[i]);
    }

    // 收集可见元素
    const refPts = new Set();
    const lsName = t => { switch(t){ case 10: case 15: return 'dashed'; case 20: return 'dotted'; case 30: return 'dash dot'; default: return ''; } };

    // 线段
    const segs = [];
    for (const [label, el] of elements) {
        if (!el.visible || el.type !== 'segment' || polyEdges.has(label)) continue;
        const cmd = cmdByOut.get(label);
        if (cmd && cmd.name === 'Segment' && cmd.inputs[0] && cmd.inputs[1]) {
            segs.push({ from: cmd.inputs[0], to: cmd.inputs[1], ls: lsName(el.lineType || 0) });
            refPts.add(cmd.inputs[0]); refPts.add(cmd.inputs[1]);
        }
    }

    // 圆
    const circs = [];
    for (const [label, el] of elements) {
        if (!el.visible || el.type !== 'conic') continue;
        const cmd = cmdByOut.get(label);
        if (cmd && cmd.name === 'Circle') {
            const cEl = elements.get(cmd.inputs[0]), tEl = elements.get(cmd.inputs[1]);
            if (cEl && tEl && cEl.x !== undefined && tEl.x !== undefined) {
                const dx = tEl.x - cEl.x, dy = tEl.y - cEl.y;
                circs.push({ center: cmd.inputs[0], radius: rv(Math.sqrt(dx * dx + dy * dy)) });
                refPts.add(cmd.inputs[0]);
            }
        }
    }

    // 多边形
    const polys = [];
    for (const [label, el] of elements) {
        if (!el.visible || el.type !== 'polygon') continue;
        const cmd = cmdByOut.get(label);
        if (cmd && cmd.name === 'Polygon') {
            const verts = [];
            for (let i = 0; cmd.inputs[i]; i++) { verts.push(cmd.inputs[i]); refPts.add(cmd.inputs[i]); }
            polys.push({ vertices: verts, alpha: el.alpha || 0 });
        }
    }

    // 角度
    const angs = [];
    for (const [label, el] of elements) {
        if (!el.visible || el.type !== 'angle') continue;
        const cmd = cmdByOut.get(label);
        if (cmd && cmd.name === 'Angle') {
            angs.push({ ptA: cmd.inputs[0], vertex: cmd.inputs[1], ptC: cmd.inputs[2], value: el.value });
            refPts.add(cmd.inputs[0]); refPts.add(cmd.inputs[1]); refPts.add(cmd.inputs[2]);
        }
    }

    for (const [label, el] of elements)
        if (el.type === 'point' && (el.visible || el.showLabel)) refPts.add(label);

    const coords = [];
    for (const label of refPts) {
        const el = elements.get(label);
        if (el && el.type === 'point' && el.x !== undefined) coords.push({ label, x: rv(el.x), y: rv(el.y) });
    }
    coords.sort((a, b) => a.label.localeCompare(b.label));

    // 生成 TikZ
    let out = '\\begin{tikzpicture}[scale=1]\n';

    if (coords.length > 0) {
        out += '  % 坐标点定义\n';
        for (const c of coords) out += `  \\coordinate (${c.label}) at (${c.x},${c.y});\n`;
        out += '\n';
    }

    out += '  % 几何元素\n';

    if (angs.length > 0) {
        for (const ang of angs) {
            const vEl = elements.get(ang.vertex), aEl = elements.get(ang.ptA), cEl = elements.get(ang.ptC);
            if (!vEl || !aEl || !cEl) continue;
            let sa = rv(Math.atan2(aEl.y - vEl.y, aEl.x - vEl.x) * 180 / Math.PI);
            let ea = rv(Math.atan2(cEl.y - vEl.y, cEl.x - vEl.x) * 180 / Math.PI);
            if (ea <= sa) ea += 360;
            out += `  \\fill[green!10] (${ang.vertex}) -- ++(${sa}:0.4) arc (${sa}:${ea}:0.4) -- cycle;\n`;
        }
        out += '\n';
    }

    if (polys.length > 0) {
        for (const p of polys) {
            if (p.alpha > 0) {
                const pth = p.vertices.map(v => `(${v})`).join(' -- ') + ' -- cycle';
                out += `  \\fill[gray!20, fill opacity=${rv(p.alpha)}] ${pth};\n`;
            }
        }
        out += '\n';
    }

    if (circs.length > 0) {
        for (const c of circs) out += `  \\draw (${c.center}) circle (${c.radius});\n`;
        out += '\n';
    }

    if (segs.length > 0) {
        const drawn = new Set();
        for (const s of segs) {
            const k = [s.from, s.to].sort().join('|');
            if (drawn.has(k)) continue;
            drawn.add(k);
            out += s.ls ? `  \\draw[${s.ls}] (${s.from}) -- (${s.to});\n` : `  \\draw (${s.from}) -- (${s.to});\n`;
        }
        out += '\n';
    }

    if (includePoints) {
        const visPts = coords.filter(c => { const e = elements.get(c.label); return e && e.visible; });
        if (visPts.length > 0) {
            out += '  % 点标记\n';
            for (const p of visPts) out += `  \\draw[fill=black] (${p.label}) circle (1pt);\n`;
            out += '\n';
        }
    }

    if (includeLabels) {
        const lblPts = coords.filter(c => { const e = elements.get(c.label); return e && (e.visible || e.showLabel); });
        if (lblPts.length > 0) {
            out += '  % 点标签\n';
            for (const p of lblPts) {
                const pos = getSmartLabelPosition(p.x, p.y, coords);
                out += `  \\node[${pos}] at (${p.label}) {$${p.label}$};\n`;
            }
        }
    }

    out += '\\end{tikzpicture}';
    return out;
}

// ─── 包装函数：standalone / tikzonly ────────────────────

function wrapStandalone(tikzCode) {
    return `\\documentclass[border=5pt]{standalone}
\\usepackage{tikz}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.15}
\\usetikzlibrary{arrows.meta}

\\begin{document}
${tikzCode}
\\end{document}
`;
}

// ─── CLI ─────────────────────────────────────────────────


module.exports = { cleanTikZCode, wrapStandalone, convertGeoGebraXML };
