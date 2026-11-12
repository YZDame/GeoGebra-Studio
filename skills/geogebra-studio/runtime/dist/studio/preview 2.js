"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.previewViewer = previewViewer;
const node_http_1 = require("node:http");
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
/** Serve just one generated document, never the surrounding workspace. */
async function previewViewer(input, workspace) {
    if (!node_path_1.default.isAbsolute(workspace))
        throw new Error('workspace must be an absolute directory path');
    const root = await (0, promises_1.realpath)(workspace);
    if (!(await (0, promises_1.stat)(root)).isDirectory())
        throw new Error('workspace must be a directory');
    const filename = await (0, promises_1.realpath)(node_path_1.default.resolve(root, input));
    if (!filename.startsWith(root + node_path_1.default.sep))
        throw new Error('Preview path is outside workspace');
    if (!/\.html$/i.test(filename))
        throw new Error('Preview input must be an HTML file');
    // Snapshot once: no other paths or files can be requested, even after a rename.
    const html = await (0, promises_1.readFile)(filename);
    const server = (0, node_http_1.createServer)((request, response) => {
        // Prevent other Host names (including DNS rebinding) from accessing the document.
        if (request.headers.host !== `127.0.0.1:${port}`) {
            response.writeHead(403).end();
            return;
        }
        if (request.url !== '/viewer.html' || !['GET', 'HEAD'].includes(request.method ?? '')) {
            response.writeHead(404).end();
            return;
        }
        response.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Length': html.byteLength,
            'Cache-Control': 'no-store',
            'X-Content-Type-Options': 'nosniff',
        });
        response.end(request.method === 'HEAD' ? undefined : html);
    });
    let port = 0;
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', () => {
            server.off('error', reject);
            const address = server.address();
            if (!address || typeof address === 'string') {
                reject(new Error('Preview listener has no port'));
                return;
            }
            port = address.port;
            resolve();
        });
    });
    return { server, filename, url: `http://127.0.0.1:${port}/viewer.html` };
}
//# sourceMappingURL=preview.js.map