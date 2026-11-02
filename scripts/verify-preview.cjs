const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { previewViewer } = require('../dist/studio/preview');

(async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'studio-preview-'));
  let preview;
  try {
    const workspace = path.join(dir, 'workspace');
    await fs.mkdir(workspace);
    const file = path.join(workspace, 'figure.html');
    const html = '<!doctype html><p>Preview fixture</p>';
    await fs.writeFile(file, html);
    await fs.writeFile(path.join(workspace, 'private.txt'), 'must not be served');
    preview = await previewViewer(file, workspace);
    assert.equal(preview.server.address().address, '127.0.0.1');
    const result = await fetch(preview.url);
    assert.equal(result.status, 200);
    assert.match(result.headers.get('content-type'), /text\/html/);
    assert.equal(result.headers.get('cache-control'), 'no-store');
    assert.equal(await result.text(), html);
    assert.equal((await fetch(preview.url, {method:'HEAD'})).status, 200);
    for (const route of ['/private.txt', '/', '/%2e%2e/private.txt']) {
      assert.equal((await fetch(new URL(route, preview.url))).status, 404);
    }
    assert.equal((await fetch(preview.url, {method:'POST'})).status, 404);
    const wrongHost = await new Promise((resolve, reject) => {
      http.get(preview.url, {headers:{Host:'untrusted.example'}}, response => {
        response.resume(); resolve(response.statusCode);
      }).on('error', reject);
    });
    assert.equal(wrongHost, 403);
    const outside = path.join(dir, 'outside.html');
    await fs.writeFile(outside, 'outside');
    await assert.rejects(previewViewer(outside, workspace), /outside workspace/);
    await fs.symlink(outside, path.join(workspace, 'escape.html'));
    await assert.rejects(previewViewer('escape.html', workspace), /outside workspace/);
    // The listener must not follow replacement symlinks after validation.
    await fs.unlink(file);
    await fs.symlink(outside, file);
    assert.equal(await (await fetch(preview.url)).text(), html);
    console.log(JSON.stringify({loopbackPreview:true,singleDocument:true,pathSafety:true,hostCheck:true}));
  } finally {
    if (preview) {
      preview.server.closeAllConnections();
      await new Promise(resolve => preview.server.close(resolve));
    }
    await fs.rm(dir, {recursive:true,force:true});
  }
})().catch(error => {console.error(error);process.exitCode=1;});
