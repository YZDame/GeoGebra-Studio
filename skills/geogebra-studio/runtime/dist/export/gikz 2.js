"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gikzBrowserScripts = gikzBrowserScripts;
exports.cleanWithGikz = cleanWithGikz;
const fs_1 = require("fs");
const runtime_assets_1 = require("./runtime-assets");
const core = require('../../gikz/core.cjs');
/** Source and GPL license travel with the viewer; no eval or external cleaner. */
function gikzBrowserScripts() {
    const source = (0, fs_1.readFileSync)((0, runtime_assets_1.runtimeAsset)('gikz-browser.js'), 'utf8').replace(/<\/script/gi, '<\\/script');
    const license = JSON.stringify((0, fs_1.readFileSync)((0, runtime_assets_1.gikzLicensePath)(), 'utf8')).replace(/</g, '\\u003c');
    return `<script id="gikz-license" type="application/json">${license}</script>\n<script id="gikz-browser">${source}</script>`;
}
async function cleanWithGikz(source, options = {}) {
    if (source.length > 10_000_000)
        throw new Error('Gikz input exceeds 10 MB');
    let code = source.includes('<geogebra') && source.includes('<construction')
        ? core.convertGeoGebraXML(source, options) : core.cleanTikZCode(source, options);
    if (options.standalone)
        code = core.wrapStandalone(code);
    if (!code.includes('\\begin{tikzpicture}'))
        throw new Error('Gikz returned invalid TikZ');
    return code;
}
//# sourceMappingURL=gikz.js.map