"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildArtifact = buildArtifact;
const promises_1 = require("fs/promises");
const geogebra_instance_1 = require("../utils/geogebra-instance");
const html_1 = require("../export/html");
const files_1 = require("../export/files");
/** Isolated native execution → packed GGB → reopen final viewer → save, never a shared pool reset. */
async function buildArtifact(options) {
    if (!/\.html$/i.test(options.filename))
        throw new Error('filename must end in .html');
    if (!options.ggbBase64 && !options.commands?.length)
        throw new Error('Provide nonempty commands or a packed ggbBase64');
    const engine = new geogebra_instance_1.GeoGebraInstance({ width: options.width || 1000, height: options.height || 800 });
    let filename;
    let previewFilename;
    let committed = false;
    try {
        await engine.initialize();
        await engine.renderHtml((0, html_1.constructionHtml)(options));
        const checks = await engine.debugEvaluate(() => {
            const api = window.ggbApplet, names = api.getAllObjectNames();
            return { objects: names.length, undefinedVisibleObjects: names.filter((name) => api.getVisible(name) && !api.isDefined(name)) };
        });
        if (checks.undefinedVisibleObjects.length)
            throw new Error('Undefined visible objects: ' + checks.undefinedVisibleObjects.join(', '));
        const constructionXml = await engine.getConstructionXML();
        const ggbBase64 = await engine.exportGGB();
        const html = (0, html_1.constructionHtml)({ ...options, commands: [], ggbBase64 });
        filename = await (0, files_1.saveText)(options.filename, html);
        if (!filename)
            throw new Error('Unable to save the final HTML artifact');
        // Reopen the exact bytes written to disk so the preview and verification describe
        // the delivered file, including its packed GGB payload.
        await engine.renderHtml(await (0, promises_1.readFile)(filename, 'utf8'));
        const layout = await engine.debugEvaluate(() => {
            const checks = window.geogebraStudio.checks;
            return { ready: window.ggbReady === true, error: window.ggbError || null,
                equalAxes: checks.equalAxes, viewWidth: checks.viewWidth, viewHeight: checks.viewHeight };
        });
        if (!layout.ready || layout.error || !layout.equalAxes || layout.viewWidth <= 0 || layout.viewHeight <= 0)
            throw new Error('Final HTML viewer verification failed: ' + JSON.stringify(layout));
        const packedObjects = await engine.getAllObjectNames();
        if (packedObjects.length !== checks.objects)
            throw new Error('Packed GGB round trip changed object count');
        const preview = await engine.capturePreview();
        previewFilename = await (0, files_1.saveFile)(options.filename.replace(/\.html$/i, '.preview.png'), preview);
        committed = true;
        const data = { success: true, format: 'html', filename, previewFilename, html, constructionXml, engineVerified: true, packedGgbVerified: true,
            layoutChecks: { loaded: true, equalAxes: layout.equalAxes, viewWidth: layout.viewWidth, viewHeight: layout.viewHeight }, renderVerified: true, requiresNetwork: true, objectCount: checks.objects,
            note: 'Native execution, saved HTML reopen, packed GGB, equal axes and preview capture passed. Inspect the attached preview for visual quality.' };
        return { content: [{ type: 'text', text: JSON.stringify(data) }, { type: 'image', mimeType: 'image/png', data: Buffer.from(preview).toString('base64') }], structuredContent: data };
    }
    finally {
        if (!committed && previewFilename)
            await (0, promises_1.unlink)(previewFilename);
        if (!committed && filename)
            await (0, promises_1.unlink)(filename);
        await engine.cleanup();
    }
}
//# sourceMappingURL=artifact.js.map