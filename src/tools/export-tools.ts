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
const filename = {type:'string',description:'Optional new file within workspace; existing files are not overwritten.'};
export const exportTools: ToolDefinition[] = [
  {
    tool:{name:'geogebra_create_html',description:'Generate a standalone interactive GeoGebra HTML with current-state GGB, PNG, SVG, PDF, XML and HTML downloads. No Chromium needed to generate; opening requires GeoGebra network access.',
      annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:false,openWorldHint:false},
      _meta:{ui:{resourceUri:'ui://geogebra/preview.html'}},
      inputSchema:{type:'object',properties:{
        title:{type:'string',maxLength:500},commands:{type:'array',items:{type:'string',maxLength:10000},maxItems:2000},
        ggbBase64:{type:'string',description:'Optional packed GGB; commands run after loading it.'},
        width:{type:'integer',minimum:200,maximum:4000},height:{type:'integer',minimum:200,maximum:4000},
        visibleLabels:{type:'array',items:{type:'string'}},filename,
      },additionalProperties:false}},
    handler:safe(async p=>{
      if(!p['commands']&&!p['ggbBase64']) throw new Error('Provide commands or ggbBase64');
      const html=constructionHtml(p);
      const saved=await saveText(p['filename'],html);
      return textResult({success:true,format:'html',html,...(saved?{filename:saved}:{}),requiresNetwork:true,renderVerified:false});
    }),
  },
  {
    tool:{name:'geogebra_export_html',description:'Package the current server-side construction in an interactive HTML, preserving its GGB styling and definitions.',_meta:{ui:{resourceUri:'ui://geogebra/preview.html'}},inputSchema:{type:'object',properties:{title:{type:'string'},filename},additionalProperties:false}},
    handler:safe(async p=>{
      const ggbBase64=await (await instancePool.getDefaultInstance()).exportGGB();
      const html=constructionHtml({title:typeof p['title']==='string'?p['title']:'GeoGebra construction',ggbBase64});
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
    tool:{name:'geogebra_export_source',description:'Export an explicit semantic subset to TikZ, Asymptote, or mixed TSQX/Asymptote. Supports independent points, two-point midpoint, segments, polygons, center-point and three-point circles. Strict by default; partial drafts report omissions and frozen dependencies.',
      inputSchema:{type:'object',properties:{format:{type:'string',enum:['tikz','asymptote','tsqx']},xml:{type:'string'},strict:{type:'boolean',default:true},standalone:{type:'boolean',default:true},filename},required:['format'],additionalProperties:false}},
    handler:safe(async p=>{
      const result=exportSource(await scene(p),p['format'] as SourceFormat,p['strict']!==false,p['standalone']!==false);
      const saved=await saveText(p['filename'],result.code);
      return textResult({success:true,...result,...(saved?{filename:saved}:{}),renderVerified:false});
    }),
  },
  {
    tool:{name:'geogebra_clean_tikz',description:'Clean native GeoGebra TikZ text or convert XML through a separately configured Gikz CLI. This is visual cleanup, not a guarantee of preserved construction semantics.',
      inputSchema:{type:'object',properties:{source:{type:'string',maxLength:10000000},standalone:{type:'boolean'},points:{type:'boolean'},labels:{type:'boolean'},round:{type:'boolean'},filename},required:['source'],additionalProperties:false}},
    handler:safe(async p=>{
      const code=await cleanWithGikz(p['source'] as string,p);
      const saved=await saveText(p['filename'],code);
      return textResult({success:true,format:'tikz',code,...(saved?{filename:saved}:{}),backend:'external-gikz',semantics:'not-guaranteed',renderVerified:false});
    }),
  },
];
