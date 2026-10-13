declare const window: any;
import { readFile, unlink } from 'fs/promises';
import { GeoGebraInstance } from '../utils/geogebra-instance';
import { constructionHtml, HtmlOptions } from '../export/html';
import { saveFile, saveText } from '../export/files';
/** Isolated native execution → packed GGB → reopen final viewer → save, never a shared pool reset. */
export async function buildArtifact(options:HtmlOptions & {filename:string}) {
  if(!/\.html$/i.test(options.filename))throw new Error('filename must end in .html');
  if(!options.ggbBase64&&!options.commands?.length)throw new Error('Provide nonempty commands or a packed ggbBase64');
  const engine=new GeoGebraInstance({width:options.width||1000,height:options.height||800});
  let filename:string|undefined;
  let previewFilename:string|undefined;
  let committed=false;
  try{
    await engine.initialize();
    await engine.renderHtml(constructionHtml(options));
    const checks=await engine.debugEvaluate<{objects:number;undefinedVisibleObjects:string[]}>(()=>{
      const api=(window as any).ggbApplet,names=api.getAllObjectNames();
      return {objects:names.length,undefinedVisibleObjects:names.filter((name:string)=>api.getVisible(name)&&!api.isDefined(name))};
    });
    if(checks.undefinedVisibleObjects.length)throw new Error('Undefined visible objects: '+checks.undefinedVisibleObjects.join(', '));
    const ggbBase64=await engine.exportGGB();
    const html=constructionHtml({...options,commands:[],ggbBase64});
    filename=await saveText(options.filename,html);
    if(!filename)throw new Error('Unable to save the final HTML artifact');
    // Reopen the exact bytes written to disk so the preview and verification describe
    // the delivered file, including its packed GGB payload.
    await engine.renderHtml(await readFile(filename,'utf8'));
    const layout=await engine.debugEvaluate<{ready:boolean;error:string|null;equalAxes:boolean;viewWidth:number;viewHeight:number}>(()=>{
      const api=(window as any).ggbApplet,view=JSON.parse(api.getViewProperties(1));
      return {ready:(window as any).ggbReady===true,error:(window as any).ggbError||null,
        equalAxes:Math.abs(view.invXscale/view.invYscale-1)<1e-6,viewWidth:view.width,viewHeight:view.height};
    });
    if(!layout.ready||layout.error||!layout.equalAxes||layout.viewWidth<=0||layout.viewHeight<=0)
      throw new Error('Final HTML viewer verification failed: '+JSON.stringify(layout));
    const packedObjects=await engine.getAllObjectNames();
    if(packedObjects.length!==checks.objects)throw new Error('Packed GGB round trip changed object count');
    const preview=await engine.capturePreview();
    previewFilename=await saveFile(options.filename.replace(/\.html$/i,'.preview.png'),preview);
    committed=true;
    const data={success:true,format:'html',filename,previewFilename,html,engineVerified:true,packedGgbVerified:true,
      layoutChecks:{loaded:true,equalAxes:layout.equalAxes,viewWidth:layout.viewWidth,viewHeight:layout.viewHeight},renderVerified:true,requiresNetwork:true,objectCount:checks.objects,
      note:'Native execution, saved HTML reopen, packed GGB, equal axes and preview capture passed. Inspect the attached preview for visual quality.'};
    return {content:[{type:'text' as const,text:JSON.stringify(data)},{type:'image' as const,mimeType:'image/png',data:Buffer.from(preview).toString('base64')}],structuredContent:data};
  }finally{
    if(!committed&&previewFilename)await unlink(previewFilename);
    if(!committed&&filename)await unlink(filename);
    await engine.cleanup();
  }
}
