"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.managedBrowserPath = exports.browserCache = void 0;
exports.browserCandidates = browserCandidates;
exports.resolveBrowser = resolveBrowser;
exports.prepareBrowser = prepareBrowser;
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const { PUPPETEER_REVISIONS } = require('puppeteer-core');
const browsers_1 = require("@puppeteer/browsers");
const browserCache = () => path_1.default.join(process.env['GEOGEBRA_STUDIO_HOME'] || path_1.default.join(os_1.default.homedir(), '.cache', 'geogebra-studio'), 'browsers');
exports.browserCache = browserCache;
const managedBrowserPath = () => (0, browsers_1.computeExecutablePath)({ cacheDir: (0, exports.browserCache)(), browser: browsers_1.Browser.CHROME, buildId: PUPPETEER_REVISIONS.chrome });
exports.managedBrowserPath = managedBrowserPath;
function browserCandidates() {
    const explicit = process.env['PUPPETEER_EXECUTABLE_PATH'];
    if (explicit)
        return [explicit];
    return [
        ...(process.platform === 'darwin' ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', path_1.default.join(os_1.default.homedir(), 'Applications/Google Chrome.app/Contents/MacOS/Google Chrome')] : []),
        ...(process.platform === 'win32' ? [process.env['PROGRAMFILES'], process.env['PROGRAMFILES(X86)'], process.env['LOCALAPPDATA']].filter((v) => !!v).map(v => path_1.default.join(v, 'Google', 'Chrome', 'Application', 'chrome.exe')) : []),
        ...(process.platform === 'linux' ? ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'] : []),
        (0, exports.managedBrowserPath)(),
    ].filter((value, index, all) => all.indexOf(value) === index);
}
/** Runtime lookup is cheap; installation/doctor additionally probes launch compatibility. */
function resolveBrowser() {
    if (!process.env['PUPPETEER_EXECUTABLE_PATH']) {
        try {
            const selected = (0, fs_1.readFileSync)(path_1.default.join((0, exports.browserCache)(), 'selected.txt'), 'utf8').trim();
            if ((0, fs_1.existsSync)(selected))
                return selected;
        }
        catch { /* No prepared runtime yet. */ }
    }
    const executable = browserCandidates().find(file => (0, fs_1.existsSync)(file));
    if (!executable)
        throw new Error('Chrome is unavailable. Run: npx @lydt/geogebra-studio browser install');
    return executable;
}
async function rememberBrowser(file) { await (0, promises_1.mkdir)((0, exports.browserCache)(), { recursive: true }); await (0, promises_1.writeFile)(path_1.default.join((0, exports.browserCache)(), 'selected.txt'), file, 'utf8'); return file; }
async function prepareBrowser(download = false) {
    const failures = [];
    for (const file of browserCandidates().filter(file => (0, fs_1.existsSync)(file))) {
        try {
            const browser = await puppeteer_core_1.default.launch({ executablePath: file, headless: true, timeout: 15000 });
            await browser.close();
            return rememberBrowser(file);
        }
        catch (error) {
            failures.push(`${file}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    if (!download)
        throw new Error('No usable Chrome. Run: npx @lydt/geogebra-studio browser install. ' + failures.join('; '));
    const installed = await (0, browsers_1.install)({ browser: browsers_1.Browser.CHROME, buildId: PUPPETEER_REVISIONS.chrome, cacheDir: (0, exports.browserCache)() });
    const browser = await puppeteer_core_1.default.launch({ executablePath: installed.executablePath, headless: true, timeout: 15000 });
    await browser.close();
    return rememberBrowser(installed.executablePath);
}
//# sourceMappingURL=browser.js.map