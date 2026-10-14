import { buildArtifact } from '../studio/artifact';
import { HtmlOptions } from '../export/html';
import { ToolDefinition } from '../types/mcp';
import { constructionHtml } from '../export/html';
import { sceneFromXML, exportSource, SourceFormat } from '../export/semantic';
import { cleanWithGikz } from '../export/gikz';
import { saveText } from '../export/files';
import { instancePool } from './geogebra-tools';

const textResult = (value: Record<string, unknown>) => ({content:[{type:'text' as const,text:JSON.stringify(value)}],structuredContent:value});
const safe = (handler: ToolDefinition['handler']): ToolDefinition['handler'] => async params => {
  try { return await handler(params); }
  catch(e) { return {...textResult({success:false,error:e instanceof Error?e.message:String(e)}),isError:true}; }
};
const scene = async (params: Record<string, unknown>) => sceneFromXML(
  typeof params['xml']==='string' ? params['xml'] : await (await instancePool.getDefaultInstance()).getConstructionXML()
);
/** Both named TikZ export and format=tikz use native PGF, then mandatory Gikz.
 * Optional XML is loaded temporarily; restore the shared live construction even on failure.
 */
async function nativeCleanedTikz(p: Record<string, unknown>) {
  const engine = await instancePool.getDefaultInstance();
  const xml = typeof p['xml'] === 'string' ? sceneFromXML(p['xml']).xml : undefined;
  const previous = xml ? await engine.getConstructionXML() : undefined;
  let source: string;
  try {
    if (xml) await engine.callAppsApi('setXML', [xml]);
    source = await engine.exportNativeTikZ();
  } finally {
    if (previous) await engine.callAppsApi('setXML', [previous]);
  }
  const code = await cleanWithGikz(source, {standalone: p['standalone'] !== false});
  const saved = await saveText(p['filename'], code);
  return textResult({success:true,format:'tikz',code,backend:'native-pgf+gikz',cleaned:true,
    semantics:'visual-snapshot',complete:false,coordinateFallbacks:[],unsupportedObjects:[],
    warnings:['Native PGF followed by Gikz produces a visual snapshot; construction dependencies are retained in GGB/XML, not guaranteed in TikZ.',
      'Gikz normalizes colors, line widths, labels and coordinate precision. Inspect the printed result.'],
    ...(saved ? {filename:saved} : {}),renderVerified:false});
}
const filename = {type:'string',description:'Optional new file within workspace; existing files are not overwritten.'};
export const exportTools: ToolDefinition[] = [
  {
    tool:{name:'geogebra_build_artifact',description:'Standard problem-to-diagram flow: execute ordered commands through the official GeoGebra applet, create editable local HTML with a packed GGB and return an interactive preview plus constructionXml for source export. Requires Chrome and GeoGebra network access; writes new workspace files only.',
      _meta:{ui:{resourceUri:'ui://geogebra/preview.html'}},
      inputSchema:{type:'object',properties:{
        commands:{type:'array',items:{type:'string',maxLength:10000},maxItems:2000},ggbBase64:{type:'string'},
        title:{type:'string',maxLength:500},filename:{type:'string',description:'New .html file within the workspace; a sibling .preview.png is also created.'},
        width:{type:'integer',minimum:200,maximum:4000},height:{type:'integer',minimum:200,maximum:4000},
        showAxes:{type:'boolean',description:'Show Cartesian x- and y-axes; required for coordinate-based diagrams.'},
        visibleLabels:{type:'array',items:{type:'string'}},captionOverrides:{type:'object',additionalProperties:{type:'string'}}
      },required:['filename'],additionalProperties:false}},
    handler:safe(async p=>buildArtifact(p as unknown as HtmlOptions & {filename:string})),
  },
  {
    tool:{name:'geogebra_create_html',description:'Advanced compatibility route: generate an unchecked command-template GeoGebra HTML. For normal problem-to-diagram work use geogebra_build_artifact. The page includes GGB, PNG, SVG, Gikz-cleaned native TikZ, PDF, XML and HTML downloads.',
      annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:false,openWorldHint:false},
      _meta:{ui:{resourceUri:'ui://geogebra/preview.html'}},
      inputSchema:{type:'object',properties:{
        title:{type:'string',maxLength:500},commands:{type:'array',items:{type:'string',maxLength:10000},maxItems:2000},
        ggbBase64:{type:'string',description:'Optional packed GGB; commands run after loading it.'},
        width:{type:'integer',minimum:200,maximum:4000},height:{type:'integer',minimum:200,maximum:4000},
        showAxes:{type:'boolean',description:'Show Cartesian x- and y-axes; use true for coordinate-based diagrams.'},
        visibleLabels:{type:'array',items:{type:'string'}},
        captionOverrides:{type:'object',description:'Optional LaTeX or plain-text captions keyed by GeoGebra object name.',additionalProperties:{type:'string'}},
        filename,
      },additionalProperties:false}},
    handler:safe(async p=>{
      if(!p['commands']&&!p['ggbBase64']) throw new Error('Provide commands or ggbBase64');
      const html=constructionHtml(p);
      const saved=await saveText(p['filename'],html);
      return textResult({success:true,format:'html',html,...(saved?{filename:saved}:{}),requiresNetwork:true,renderVerified:false});
    }),
  },
  {
    tool:{name:'geogebra_export_html',description:'Advanced compatibility route: package the shared server-side construction in an interactive HTML. For normal problem-to-diagram work use geogebra_build_artifact. Set showAxes=true for coordinate-based diagrams.',_meta:{ui:{resourceUri:'ui://geogebra/preview.html'}},inputSchema:{type:'object',properties:{title:{type:'string'},showAxes:{type:'boolean',description:'Show Cartesian axes in the exported viewer; use true for coordinate-based diagrams.'},filename},additionalProperties:false}},
    handler:safe(async p=>{
      const ggbBase64=await (await instancePool.getDefaultInstance()).exportGGB();
      const html=constructionHtml({title:typeof p['title']==='string'?p['title']:'GeoGebra construction',ggbBase64,showAxes:p['showAxes']===true});
      const saved=await saveText(p['filename'],html);
      return textResult({success:true,format:'html',html,...(saved?{filename:saved}:{}),requiresNetwork:true});
    }),
  },
  {
    tool:{name:'geogebra_get_semantic_scene',description:'Read the original construction XML, command dependencies, coordinates, visibility, captions, and styles for editable export or AI-assisted reconstruction.',
      inputSchema:{type:'object',properties:{xml:{type:'string',description:'Optional original XML; omit to inspect live GeoGebra.'}},additionalProperties:false}},
    handler:safe(async p=>textResult({success:true,scene:await scene(p)})),
  },
  {
    tool:{name:'geogebra_export_tikz',description:'Export current GeoGebra native PGF through mandatory Gikz cleanup. Returns a visual snapshot, not editable construction dependencies. No raw fallback.',
      inputSchema:{type:'object',properties:{xml:{type:'string'},standalone:{type:'boolean',default:true},filename},additionalProperties:false}},
    handler:safe(nativeCleanedTikz),
  },
  {
    tool:{name:'geogebra_export_source',description:'Export a construction as TikZ, Asymptote, or TSQX. Pass constructionXml returned by geogebra_build_artifact to export that same diagram. TikZ uses native GeoGebra PGF followed by mandatory Gikz cleanup; Asymptote and TSQX use the validated semantic subset.',
      inputSchema:{type:'object',properties:{format:{type:'string',enum:['tikz','asymptote','tsqx']},xml:{type:'string',description:'Original construction XML; pass constructionXml from geogebra_build_artifact to export that diagram.'},strict:{type:'boolean',default:true},standalone:{type:'boolean',default:true},filename},required:['format'],additionalProperties:false}},
    handler:safe(async p=>{
      if (p['format'] === 'tikz') return nativeCleanedTikz(p);
      const result=exportSource(await scene(p),p['format'] as SourceFormat,p['strict']!==false,p['standalone']!==false);
      const saved=await saveText(p['filename'],result.code);
      return textResult({success:true,...result,...(saved?{filename:saved}:{}),renderVerified:false});
    }),
  },
  {
    tool:{name:'geogebra_clean_tikz',description:'Clean native GeoGebra TikZ text or convert XML through built-in Gikz. This is visual cleanup, not a guarantee of preserved construction semantics.',
      inputSchema:{type:'object',properties:{source:{type:'string',maxLength:10000000},standalone:{type:'boolean'},points:{type:'boolean'},labels:{type:'boolean'},round:{type:'boolean'},filename},required:['source'],additionalProperties:false}},
    handler:safe(async p=>{
      const code=await cleanWithGikz(p['source'] as string,p);
      const saved=await saveText(p['filename'],code);
      return textResult({success:true,format:'tikz',code,...(saved?{filename:saved}:{}),backend:'built-in-gikz',semantics:'not-guaranteed',renderVerified:false});
    }),
  },
];
