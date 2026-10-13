import path from 'path';
import { readFileSync } from 'fs';
interface GikzOptions {standalone?:boolean;points?:boolean;labels?:boolean;round?:boolean}
const core = require('../../gikz/core.cjs') as {
  cleanTikZCode(source:string,options:GikzOptions):string;
  convertGeoGebraXML(source:string,options:GikzOptions):string;
  wrapStandalone(source:string):string;
};
/** Source and GPL license travel with the viewer; no eval or external cleaner. */
export function gikzBrowserScripts(): string {
  const source=readFileSync(path.join(__dirname,'../../dist/gikz-browser.js'),'utf8').replace(/<\/script/gi,'<\\/script');
  const license=JSON.stringify(readFileSync(path.join(__dirname,'../../gikz/LICENSE'),'utf8')).replace(/</g,'\\u003c');
  return `<script id="gikz-license" type="application/json">${license}</script>\n<script id="gikz-browser">${source}</script>`;
}
export async function cleanWithGikz(source:string,options:GikzOptions={}):Promise<string>{
  if(source.length>10_000_000)throw new Error('Gikz input exceeds 10 MB');
  let code=source.includes('<geogebra')&&source.includes('<construction')
    ?core.convertGeoGebraXML(source,options):core.cleanTikZCode(source,options);
  if(options.standalone)code=core.wrapStandalone(code);
  if(!code.includes('\\begin{tikzpicture}'))throw new Error('Gikz returned invalid TikZ');
  return code;
}
