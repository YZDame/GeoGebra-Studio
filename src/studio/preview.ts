import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';

/** Serve just one generated document, never the surrounding workspace. */
export async function previewViewer(input: string, workspace: string) {
  if (!path.isAbsolute(workspace)) throw new Error('workspace must be an absolute directory path');
  const root = await realpath(workspace);
  if (!(await stat(root)).isDirectory()) throw new Error('workspace must be a directory');
  const filename = await realpath(path.resolve(root, input));
  if (!filename.startsWith(root + path.sep)) throw new Error('Preview path is outside workspace');
  if (!/\.html$/i.test(filename)) throw new Error('Preview input must be an HTML file');
  // Snapshot once: no other paths or files can be requested, even after a rename.
  const html = await readFile(filename);
  const server = createServer((request, response) => {
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
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject);
      const address = server.address();
      if (!address || typeof address === 'string') { reject(new Error('Preview listener has no port')); return; }
      port = address.port;
      resolve();
    });
  });
  return { server, filename, url: `http://127.0.0.1:${port}/viewer.html` };
}
