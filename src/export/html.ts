export interface HtmlOptions {
  title?: string;
  commands?: string[];
  ggbBase64?: string;
  width?: number;
  height?: number;
  visibleLabels?: string[];
}

// JSON embedded in script must not be able to terminate its containing element.
const scriptJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** The same small applet boot path serves generated HTML and the headless engine. */
export function constructionHtml(options: HtmlOptions = {}): string {
  const title = options.title ?? 'GeoGebra construction';
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>body{margin:24px;font:16px system-ui;background:#faf9f6;color:#202020}main{max-width:1000px;margin:auto}#ggb-element{background:white;overflow:auto}nav{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}button{padding:9px 16px;cursor:pointer}#status{min-height:24px} @media print{nav,h1,#status{display:none}body{margin:0}}</style>
</head><body><main><h1>${escapeHtml(title)}</h1><p id="status" role="status">Loading GeoGebra — internet access is required.</p>
<div id="ggb-element"></div><nav id="exports">
${['ggb', 'png', 'svg', 'pdf', 'xml', 'html'].map(f => `<button disabled data-format="${f}">Download ${f.toUpperCase()}</button>`).join('')}
<button disabled data-format="fit">Fit view</button></nav></main>
<script>
const specification = ${scriptJson(options)};
window.ggbReady = false;
window.ggbError = null;
let api;
const status = document.getElementById('status');
function download(data, mime, extension, base64=false) {
  const bytes = base64 ? Uint8Array.from(atob(data.replace(/^data:[^,]+,/, '')), c => c.charCodeAt(0)) : data;
  const url = URL.createObjectURL(new Blob([bytes], {type:mime}));
  const link = document.createElement('a'); link.href=url; link.download='construction.'+extension; link.click();
  setTimeout(()=>URL.revokeObjectURL(url), 10000);
}
async function fitView() {
  if(!api.getAllObjectNames().length)return;
  api.showAllObjects();await new Promise(resolve=>setTimeout(resolve,600));
  const view=JSON.parse(api.getViewProperties(1));
  const sx=Math.max(view.width*view.invXscale*1.4,2);
  const sy=Math.max(view.height*view.invYscale*1.4,2);
  const scale=Math.max(sx/view.width,sy/view.height);
  const cx=view.xMin+view.width*view.invXscale/2;
  const cy=view.yMin+view.height*view.invYscale/2;
  api.setCoordSystem(cx-view.width*scale/2,cx+view.width*scale/2,cy-view.height*scale/2,cy+view.height*scale/2);
}
function callbackExport(format) {
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error(format+' export timed out')),20000);
    const done=value=>{clearTimeout(timer); value ? resolve(value) : reject(new Error(format+' export returned no data'));};
    try {
      if(format==='ggb') api.getBase64(done);
      else if(format==='pdf') api.exportPDF(1,done);
      else api.exportSVG(done);
    } catch(e) { clearTimeout(timer); reject(e); }
  });
}
document.getElementById('exports').onclick=async event=>{
  const format=event.target.dataset.format;if(!format||!window.ggbReady)return;
  try {
    if(format==='fit'){await fitView();status.textContent='View fitted with equal axis scales.';return;}
    if(format==='xml') download(api.getXML(),'application/xml','xml');
    else if(format==='png') download(api.getPNGBase64(2,false,144),'image/png','png',true);
    else if(format==='html') {
      const base64=await callbackExport('ggb');
      // Save the edited applet state as well as the original definitions.
      const html=window.constructionTemplate.replace(/const specification = .*?;\\nwindow.ggbReady/, ()=>'const specification = '+JSON.stringify({...specification,commands:[],ggbBase64:base64}).replace(/</g,'\\\\u003c')+';\\nwindow.ggbReady');
      download(html,'text/html','html');
    } else {
      const value=await callbackExport(format);
      download(value,{ggb:'application/vnd.geogebra.file',svg:'image/svg+xml',pdf:'application/pdf'}[format],format,format!=='svg');
    }
    status.textContent='Export ready.';
  } catch(e) {status.textContent=e.message;}
};
window.startGeoGebra=()=>{
  window.constructionTemplate='<!doctype html>\\n'+document.documentElement.outerHTML;
  const applet=new GGBApplet({appName:'classic',width:specification.width||800,height:specification.height||600,
    language:'en',showToolBar:false,showMenuBar:false,showAlgebraInput:false,showResetIcon:false,
    useBrowserForJS:false,preventFocus:true,enableLabelDrags:true,enableShiftDragZoom:true,
    ...(specification.ggbBase64 ? {ggbBase64:specification.ggbBase64}:{}),
    appletOnLoad:async loaded=>{
      api=loaded;window.ggbApplet=api;
      try {
        api.setErrorDialogsActive(false);
        for(const command of specification.commands||[]) {
          if(!api.evalCommand(command)) throw new Error('GeoGebra rejected: '+command);
        }
        if(!specification.ggbBase64){
          api.setPerspective('G');api.setAxesVisible(false,false);api.setGridVisible(false);
          for(const name of api.getAllObjectNames()) {
            const point=api.getObjectType(name)==='point';
            api.setCaption(name,'$'+name+'$');api.setLabelStyle(name,3);
            api.setLabelVisible(name,specification.visibleLabels ? specification.visibleLabels.includes(name) : point);
            api.setColor(name,0,0,0);
            if(point){api.setPointSize(name,2);api.setPointStyle(name,0);}else{api.setLineThickness(name,2);}
          }
        }
        if((specification.commands||[]).length)await fitView();
        window.ggbReady=true;status.textContent='Ready. Drag points to explore; downloads contain the current construction.';
        document.querySelectorAll('button').forEach(button=>button.disabled=false);
      } catch(e){window.ggbError=e.message;status.textContent=e.message;}
    }
  },true);applet.inject('ggb-element');
};
setTimeout(()=>{if(!window.ggbReady&&!window.ggbError)status.textContent='Still loading. Check access to geogebra.org and try reloading.';},30000);
</script>
<script src="https://www.geogebra.org/apps/deployggb.js" onload="startGeoGebra()" onerror="window.ggbError='Could not load GeoGebra. Check internet access.';document.getElementById('status').textContent=window.ggbError"></script>
</body></html>`;
}
