"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
exports.installPlugin = installPlugin;
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const promises_1 = require("fs/promises");
const child_process_1 = require("child_process");
async function run(command, args, cwd) {
    await new Promise((resolve, reject) => {
        const child = (0, child_process_1.spawn)(command, args, { stdio: 'inherit', shell: false, ...(cwd ? { cwd } : {}) });
        child.once('error', reject);
        child.once('close', code => code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`)));
    });
}
/** A persistent catalog uses an npm source, never the temporary npx package directory. */
async function installPlugin(local = false) {
    const metadata = JSON.parse(await (0, promises_1.readFile)(path_1.default.join(__dirname, '../../package.json'), 'utf8'));
    const home = process.env['CODEX_HOME'] || path_1.default.join(os_1.default.homedir(), '.codex');
    const root = path_1.default.join(home, 'geogebra-studio', 'marketplace');
    await (0, promises_1.mkdir)(path_1.default.join(root, '.agents', 'plugins'), { recursive: true });
    let source = { source: 'npm', package: metadata.name, version: metadata.version };
    if (local) {
        // The default generator uses bundled files and Node built-ins, with no runtime install.
        const target = path_1.default.join(root, 'plugin');
        await (0, promises_1.rm)(target, { recursive: true, force: true });
        await (0, promises_1.mkdir)(target, { recursive: true });
        const packageRoot = path_1.default.join(__dirname, '../..');
        for (const entry of ['dist', 'gikz', 'skills', 'docs', 'examples', 'assets', 'plugin.json', '.codex-plugin', 'package.json', 'LICENSE', 'LICENSE-MIT', 'THIRD_PARTY_NOTICES.md'])
            await (0, promises_1.cp)(path_1.default.join(packageRoot, entry), path_1.default.join(target, entry), { recursive: true });
        const localPackagePath = path_1.default.join(target, 'package.json');
        const localPackage = JSON.parse(await (0, promises_1.readFile)(localPackagePath, 'utf8'));
        delete localPackage.devDependencies;
        await (0, promises_1.writeFile)(localPackagePath, JSON.stringify(localPackage, null, 2) + '\n');
        source = { source: 'local', path: './plugin' };
    }
    await (0, promises_1.writeFile)(path_1.default.join(root, '.agents/plugins/marketplace.json'), JSON.stringify({ name: 'geogebra-studio', interface: { displayName: 'GeoGebra Studio' }, plugins: [{ name: 'geogebra-studio', source, policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' }, category: 'Education' }] }, null, 2) + '\n');
    await run('codex', ['plugin', 'marketplace', 'add', root]);
    await run('codex', ['plugin', 'add', 'geogebra-studio@geogebra-studio']);
    console.log(`GeoGebra Studio ${metadata.version} installed. No MCP server or Chrome setup is required.\nStart a new Codex session and invoke @geogebra-studio. Existing geogebra-geometry installations were not removed.`);
}
//# sourceMappingURL=install.js.map