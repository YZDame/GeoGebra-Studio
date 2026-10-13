const {build}=require('esbuild');
const fs=require('node:fs/promises');
(async()=>{
  const result=await build({entryPoints:['widget/main.ts'],bundle:true,write:false,define:{__STUDIO_VERSION__:JSON.stringify(require('../package.json').version)},format:'iife',platform:'browser',target:'es2022',minify:true});
  const js=result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
  await fs.writeFile('dist/widget.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font:14px system-ui}#status{padding:8px}iframe{width:100%;height:780px;border:0}</style></head><body><p id="status" role="status">Waiting for a GeoGebra construction…</p><iframe id="preview" title="GeoGebra construction" sandbox="allow-scripts allow-downloads allow-same-origin"></iframe><script>${js}</script></body></html>`);
})().catch(e=>{console.error(e);process.exitCode=1});
