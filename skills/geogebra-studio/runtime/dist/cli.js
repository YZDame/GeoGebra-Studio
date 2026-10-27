#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/** Portable local CLI. No MCP transport or persistent service. */
const promises_1 = require("fs/promises");
const metadata = require('../package.json');
function help() {
    console.log(`GeoGebra Studio ${metadata.version} — local geometry Skill
Usage:
  geogebra-studio generate --input SPEC.json --workspace ABS_DIR [--output FILE.html] [--verify]
  geogebra-studio export --input CONSTRUCTION.xml --format tsqx|asymptote --workspace ABS_DIR --output FILE
  geogebra-studio export --input NATIVE.pgf --format tikz --workspace ABS_DIR --output FILE.tex
  geogebra-studio doctor
  geogebra-studio browser install                 Optional browser-based verification
  geogebra-studio install [--local]              Optional Codex plugin installation
--verify and browser install need the npm package or a built checkout (Puppeteer);
install --local needs a built checkout. A copied Skill supports generate, export and doctor.
The generated HTML uses official GeoGebra assets and requires internet access.`);
}
function requireBrowserStack() {
    const missing = ['puppeteer-core', '@puppeteer/browsers'].filter(name => { try {
        require.resolve(name);
        return false;
    }
    catch {
        return true;
    } });
    if (missing.length)
        throw Error('Browser verification needs ' + missing.join(', ') + ', which a copied Skill does not bundle. Run it from the npm package (npx @lydt/geogebra-studio browser install) or a built checkout after npm install; generate without --verify works without them.');
}
function flags(args, allowed) {
    const options = {};
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (!allowed.includes(arg) || !args[i + 1] || args[i + 1].startsWith('--') || options[arg])
            throw Error('Invalid or duplicate option: ' + arg);
        options[arg] = args[++i];
    }
    return options;
}
async function main() {
    const [command, ...args] = process.argv.slice(2);
    if (!command || command === '--help' || command === '-h') {
        help();
        return;
    }
    if (command === '--version' || command === '-v') {
        console.log(metadata.version);
        return;
    }
    if (command === 'generate') {
        const verify = args.includes('--verify');
        const options = flags(args.filter(x => x !== '--verify'), ['--input', '--workspace', '--output']);
        if (!options['--input'] || !options['--workspace'])
            throw Error('generate requires --input and --workspace');
        const { validateViewerSpec, generateViewer } = await Promise.resolve().then(() => __importStar(require('./studio/generate')));
        const spec = validateViewerSpec(JSON.parse(await (0, promises_1.readFile)(options['--input'], 'utf8')));
        if (options['--output'])
            spec.filename = options['--output'];
        validateViewerSpec(spec);
        if (verify) {
            requireBrowserStack();
            const { inWorkspace } = await Promise.resolve().then(() => __importStar(require('./export/workspace')));
            const { buildArtifact } = await Promise.resolve().then(() => __importStar(require('./studio/artifact')));
            const result = await inWorkspace(options['--workspace'], () => buildArtifact(spec));
            const { html: unusedHtml, constructionXml: unusedXml, ...summary } = result.structuredContent;
            void unusedHtml;
            void unusedXml;
            console.log(JSON.stringify(summary));
        }
        else
            console.log(JSON.stringify(await generateViewer(spec, options['--workspace'])));
        return;
    }
    if (command === 'export') {
        const o = flags(args, ['--input', '--format', '--workspace', '--output']);
        if (!o['--input'] || !o['--format'] || !o['--workspace'] || !o['--output'])
            throw Error('export requires --input, --format, --workspace and --output');
        const format = o['--format'];
        if (!['tsqx', 'asymptote', 'tikz'].includes(format))
            throw Error('Unsupported format ' + format);
        const source = await (0, promises_1.readFile)(o['--input'], 'utf8');
        let code, warnings;
        if (format === 'tikz') {
            if (/<geogebra[\s>]/.test(source))
                throw Error('For accurate TikZ use the viewer native PGF download; XML is for semantic TSQX/Asymptote export.');
            const { cleanWithGikz } = await Promise.resolve().then(() => __importStar(require('./export/gikz')));
            code = await cleanWithGikz(source, { standalone: true });
        }
        else {
            const { sceneFromXML, exportSource } = await Promise.resolve().then(() => __importStar(require('./export/semantic')));
            const result = exportSource(sceneFromXML(source), format, true, true);
            code = result.code;
            warnings = result.warnings;
        }
        const { inWorkspace } = await Promise.resolve().then(() => __importStar(require('./export/workspace')));
        const { saveText } = await Promise.resolve().then(() => __importStar(require('./export/files')));
        const filename = await inWorkspace(o['--workspace'], () => saveText(o['--output'], code));
        console.log(JSON.stringify({ success: true, format, filename, bytes: Buffer.byteLength(code), ...(warnings ? { warnings } : {}) }));
        return;
    }
    if (command === 'doctor' || command === 'browser') {
        if (command === 'doctor' && args.length)
            throw Error('doctor takes no arguments');
        if (command === 'browser' && (args.length !== 1 || args[0] !== 'install'))
            throw Error('Usage: browser install');
        if (command === 'browser')
            requireBrowserStack();
        const { cleanWithGikz } = await Promise.resolve().then(() => __importStar(require('./export/gikz')));
        await cleanWithGikz(String.raw `\begin{tikzpicture}\end{tikzpicture}`);
        const { constructionHtml } = await Promise.resolve().then(() => __importStar(require('./export/html')));
        constructionHtml({ commands: ['A=(0,0)'] });
        if (command === 'browser') {
            const { prepareBrowser } = await Promise.resolve().then(() => __importStar(require('./studio/browser')));
            console.log(JSON.stringify({ success: true, executablePath: await prepareBrowser(true) }));
        }
        else
            console.log(JSON.stringify({ success: true, version: metadata.version, chromeRequired: false, mcpRequired: false }));
        return;
    }
    if (command === 'install') {
        if (args.some(a => a !== '--local'))
            throw Error('Usage: install [--local]');
        const { installPlugin } = await Promise.resolve().then(() => __importStar(require('./studio/install')));
        await installPlugin(args.includes('--local'));
        return;
    }
    throw Error('Unknown command: ' + command + '. Use --help.');
}
main().catch(e => { console.error(e instanceof Error ? e.message : String(e)); process.exitCode = 1; });
//# sourceMappingURL=cli.js.map