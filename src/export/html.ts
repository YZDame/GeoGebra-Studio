import { gikzBrowserScripts } from './gikz';
import { viewerThemes } from './viewer-themes';

export interface HtmlOptions {
  /** Kept for API compatibility; the viewer itself intentionally has no title. */
  title?: string;
  commands?: string[];
  ggbBase64?: string;
  /** Initial engine dimensions; the browser viewer resizes to its container. */
  width?: number;
  height?: number;
  visibleLabels?: string[];
  captionOverrides?: Record<string, string>;
}

const scriptJson = (value: unknown) => JSON.stringify(value)
  .replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

/** A responsive, title-free viewer for an embedded GGB or a semantic command construction. */
export function constructionHtml(options: HtmlOptions = {}): string {
  const cleaner = gikzBrowserScripts();
  const payload = scriptJson({
    commands: options.commands ?? [],
    ...(options.ggbBase64 ? { ggbBase64: options.ggbBase64 } : {}),
    visibleLabels: options.visibleLabels ?? [],
    captionOverrides: options.captionOverrides ?? {}
  });

  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark"><title>GeoGebra</title>
<style>
:root{color-scheme:light;--paper:#fffcf0;--line:#e6e4d9;--ink:#100f0f;--muted:#6f6e69;--hover:#f2f0e5}
*{box-sizing:border-box}html,body{margin:0;height:100%;overflow:hidden;background:var(--paper);color:var(--ink);font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Noto Sans CJK SC",sans-serif}
main{height:100dvh;width:100%;padding:12px 16px 16px;display:flex;flex-direction:column}
header{position:relative;z-index:10;display:flex;justify-content:flex-end;align-items:center;gap:8px;flex-shrink:0;min-height:42px;margin-bottom:8px}
.menu-control{position:relative}.control-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;appearance:none;height:38px;min-width:72px;padding:0 14px;border:1px solid var(--line);border-radius:9px;background:var(--paper);color:var(--ink);font:inherit;cursor:pointer}
.control-button:hover,.control-button[aria-expanded="true"]{background:var(--hover)}.control-button:focus-visible,.viewer-menu button:focus-visible{outline:2px solid var(--blue);outline-offset:2px}.icon-button{min-width:38px;width:38px;padding:0}.control-button svg{width:18px;height:18px;flex-shrink:0}.chevron{width:12px!important;height:12px!important}
.viewer-menu{position:absolute;top:43px;right:0;z-index:20;display:none;min-width:170px;padding:5px;border:1px solid var(--line);border-radius:10px;background:var(--paper);box-shadow:0 12px 32px rgb(16 15 15 / 12%)}
.viewer-menu.open{display:grid}.viewer-menu button{display:flex;align-items:center;gap:10px;min-height:34px;padding:0 10px;border:0;border-radius:6px;background:transparent;color:var(--ink);text-align:left;font:inherit;cursor:pointer}
.viewer-menu button:hover,.viewer-menu button[aria-checked="true"]{background:var(--hover)}.viewer-menu{max-height:min(70vh,400px);overflow:auto}.theme-name{flex:1}.swatch{width:12px;height:12px;border-radius:50%;border:1px solid rgb(128 128 128 / 35%)}.sidebar-toggle{position:absolute;top:10px;left:10px;z-index:3;box-shadow:0 2px 8px rgb(0 0 0 / 7%)}.viewer-menu button:disabled{opacity:.5;cursor:wait}
.stage{position:relative;width:100%;flex:1;min-height:200px;overflow:hidden;border:1px solid var(--line);border-radius:10px;background:var(--paper)}
#ggb-element{position:absolute;inset:0;width:100%!important;height:100%!important;overflow:hidden}
#status{position:absolute;inset:0;z-index:2;display:grid;place-items:center;margin:0;padding:16px;color:var(--muted);background:var(--paper);text-align:center;pointer-events:none}
#status[hidden]{display:none}#status.error{color:#af3029}
@media(max-width:640px){main{padding:8px}.stage{border-radius:7px}header{margin-bottom:6px}}
@media print{main{width:100%;padding:0}header,.sidebar-toggle{display:none}.stage{border:0;border-radius:0}}
</style></head><body><main>
<header><div class="menu-control"><button id="theme-toggle" class="control-button" type="button" aria-label="选择主题" aria-expanded="false" aria-haspopup="menu" aria-controls="theme-menu"><span id="theme-name">默认</span><svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div id="theme-menu" class="viewer-menu" role="menu" aria-label="配色主题"></div></div>
<button id="mode-toggle" class="control-button icon-button" type="button" aria-label="切换深浅色"></button>
<div class="menu-control downloads"><button class="control-button download-toggle" id="download-toggle" type="button" aria-expanded="false" aria-haspopup="menu" aria-controls="download-menu">下载</button>
<div class="viewer-menu" id="download-menu" role="menu" aria-label="下载格式">
<button type="button" role="menuitem" data-format="ggb">GeoGebra 文件</button>
<button type="button" role="menuitem" data-format="png">PNG 图片</button>
<button type="button" role="menuitem" data-format="svg">SVG 矢量图</button>
<button type="button" role="menuitem" data-format="tikz">TikZ 源文件 (.tex)</button>
<button type="button" role="menuitem" data-format="pdf">PDF 文档</button>
<button type="button" role="menuitem" data-format="xml">XML 源文件</button>
<button type="button" role="menuitem" data-format="html">交互 HTML</button></div></div></header>
<section class="stage" aria-label="GeoGebra 图形"><button id="sidebar-toggle" class="control-button icon-button sidebar-toggle" type="button" aria-label="展开对象栏" title="展开对象栏" aria-expanded="false" disabled><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16m4-11 3 3-3 3"/></svg></button><p id="status" role="status" aria-live="polite">正在加载…</p><div id="ggb-element"></div></section></main>
<script id="construction-data" type="application/json">${payload}</script>
${cleaner}
<script>
(()=>{
const specification=JSON.parse(document.getElementById('construction-data').textContent);
const host=document.getElementById('ggb-element'),status=document.getElementById('status');
const toggle=document.getElementById('download-toggle'),menu=document.getElementById('download-menu');
const themes=${scriptJson(viewerThemes)};
const themeMenu=document.getElementById('theme-menu'),themeToggle=document.getElementById('theme-toggle'),modeToggle=document.getElementById('mode-toggle'),sidebarToggle=document.getElementById('sidebar-toggle');
const themeNames={default:'默认',ayu:'Ayu',catppuccin:'Catppuccin',everforest:'Everforest',gruvbox:'Gruvbox','rose-pine':'Rosé Pine',nord:'Nord',solarized:'Solarized',flexoki:'Flexoki'};
themeMenu.replaceChildren();
for(const name of Object.keys(themes)){const button=document.createElement('button');button.type='button';button.dataset.theme=name;button.setAttribute('role','menuitemradio');const label=document.createElement('span');label.className='theme-name';label.textContent=themeNames[name];button.append(label);for(const palette of themes[name]){const swatch=document.createElement('span');swatch.className='swatch';swatch.style.background=palette.paper;swatch.setAttribute('aria-hidden','true');button.append(swatch)}themeMenu.append(button)}
let api,ready=false,resizeObserver,resizeFrame,resizeVersion=0,sidebarOpen=false,objectThemeApplied=false;
const themeObjectColors=new Set(Object.values(themes).flat().flatMap(p=>[p.ink,p.blue]).concat(['#000000','#666666','#4d4dff']).map(c=>c.toLowerCase()));
const validTheme=value=>typeof value==='string'&&/^[a-z-]+:[01]$/.test(value)&&Object.hasOwn(themes,value.split(':')[0]);
let chosenTheme=validTheme(specification.theme)?specification.theme:'default:0';
try{const saved=localStorage.getItem('geogebra-viewer-theme');if(validTheme(saved))chosenTheme=saved}catch(_){}
function applyTheme(){const [name,mode]=chosenTheme.split(':');const palette=themes[name][Number(mode)];for(const [key,value]of Object.entries(palette))document.documentElement.style.setProperty('--'+key,value);document.documentElement.style.colorScheme=Number(mode)?'dark':'light';document.getElementById('theme-name').textContent=themeNames[name];for(const button of themeMenu.querySelectorAll('[data-theme]'))button.setAttribute('aria-checked',String(button.dataset.theme===name));const action=Number(mode)?'切换为浅色':'切换为深色';modeToggle.setAttribute('aria-label',action);modeToggle.title=action;modeToggle.setAttribute('aria-pressed',String(Boolean(Number(mode))));modeToggle.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(Number(mode)?'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/>':'<path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z"/>')+'</svg>';if(api){const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));api.setGraphicsOptions(1,{bgColor:palette.paper});for(const object of api.getAllObjectNames()){const type=api.getObjectType(object);if(['point','text','line','segment','ray','circle','conic'].includes(type)&&((!objectThemeApplied&&!specification.ggbBase64)||themeObjectColors.has(api.getColor(object).toLowerCase())))api.setColor(object,...rgb(type==='point'&&api.isMoveable(object)?palette.blue:palette.ink))}objectThemeApplied=true}}
function saveTheme(){try{localStorage.setItem('geogebra-viewer-theme',chosenTheme)}catch(_){}applyTheme()}
themeMenu.addEventListener('click',event=>{const button=event.target.closest('[data-theme]');if(!button)return;chosenTheme=button.dataset.theme+':'+chosenTheme.split(':')[1];saveTheme();closeMenus();themeToggle.focus()});
modeToggle.addEventListener('click',()=>{chosenTheme=chosenTheme.split(':')[0]+':'+(chosenTheme.endsWith(':1')?'0':'1');saveTheme()});applyTheme();
window.ggbReady=false;window.ggbError=null;
function setStatus(text,error=false){status.textContent=text;status.classList.toggle('error',error);status.hidden=!text;}
function equalAxes(){const v=JSON.parse(api.getViewProperties(1)),unit=Math.max(v.invXscale,v.invYscale),cx=v.xMin+v.width*v.invXscale/2,cy=v.yMin+v.height*v.invYscale/2;api.setCoordSystem(cx-v.width*unit/2,cx+v.width*unit/2,cy-v.height*unit/2,cy+v.height*unit/2)}
function readCamera(){const v=JSON.parse(api.getViewProperties(1));return{cx:v.xMin+v.width*v.invXscale/2,cy:v.yMin+v.height*v.invYscale/2,span:Math.min(v.width*v.invXscale,v.height*v.invYscale)}}
function setSize(camera){if(!api)return;camera=camera||readCamera();const version=++resizeVersion;cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(async()=>{const width=Math.round(host.clientWidth),height=Math.round(host.clientHeight);if(width<1||height<1)return;const {cx,cy,span}=camera;api.setSize(width,height);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));if(version!==resizeVersion)return;const view=JSON.parse(api.getViewProperties(1)),unit=span/Math.min(view.width,view.height);api.setCoordSystem(cx-view.width*unit/2,cx+view.width*unit/2,cy-view.height*unit/2,cy+view.height*unit/2);equalAxes();sidebarToggle.style.top=Math.max(10,view.top-host.getBoundingClientRect().top+10)+'px';sidebarToggle.style.left=sidebarOpen?Math.max(10,view.left-host.getBoundingClientRect().left+10)+'px':'10px'})}
function toBytes(data){return Uint8Array.from(atob(data.replace(/^data:[^,]+,/,'')),c=>c.charCodeAt(0));}
function download(data,mime,extension,base64=false){const blob=new Blob([base64?toBytes(data):data],{type:mime});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='construction.'+extension;link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
function callbackExport(format){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('导出超时')),20000);const done=value=>{clearTimeout(timer);value?resolve(value):reject(new Error('GeoGebra 未返回文件'))};try{if(format==='ggb')api.getBase64(done);else if(format==='pdf')api.exportPDF(1,done);else if(format==='tikz')api.exportPGF(done);else api.exportSVG(done)}catch(error){clearTimeout(timer);reject(error)}})}
async function fitView(){api.showAllObjects();await new Promise(resolve=>setTimeout(resolve,650));const view=JSON.parse(api.getViewProperties(1));let xmin=Infinity,xmax=-Infinity,ymin=Infinity,ymax=-Infinity,hasCircle=false,unsupported=false;for(const name of api.getAllObjectNames()){if(!api.getVisible(name))continue;const type=api.getObjectType(name);if(type==='point'){const x=api.getXcoord(name),y=api.getYcoord(name);if(Number.isFinite(x)&&Number.isFinite(y)){xmin=Math.min(xmin,x);xmax=Math.max(xmax,x);ymin=Math.min(ymin,y);ymax=Math.max(ymax,y)}}else if(type==='circle'||type==='conic'){const xml=new DOMParser().parseFromString('<root>'+api.getXML(name)+'</root>','application/xml'),matrix=xml.querySelector('matrix');if(!matrix){unsupported=true;continue}const a=[0,1,2,3,4,5].map(i=>Number(matrix.getAttribute('A'+i)));if(Math.abs(a[0]-a[1])>1e-8||Math.abs(a[3])>1e-8||!a[0]){unsupported=true;continue}const x=-a[4]/a[0],y=-a[5]/a[0],r=Math.sqrt(x*x+y*y-a[2]/a[0]);if(Number.isFinite(r)){hasCircle=true;xmin=Math.min(xmin,x-r);xmax=Math.max(xmax,x+r);ymin=Math.min(ymin,y-r);ymax=Math.max(ymax,y+r)}}else if(!['line','ray','segment','text','numeric','boolean'].includes(type))unsupported=true}if(!hasCircle||unsupported){xmin=view.xMin;xmax=xmin+view.width*view.invXscale;ymin=view.yMin;ymax=ymin+view.height*view.invYscale}const unit=Math.max((xmax-xmin)*1.16/view.width,(ymax-ymin)*1.16/view.height,2/Math.min(view.width,view.height)),cx=(xmin+xmax)/2,cy=(ymin+ymax)/2;api.setCoordSystem(cx-view.width*unit/2,cx+view.width*unit/2,cy-view.height*unit/2,cy+view.height*unit/2)}

function applyMcpDefaults(){const names=api.getAllObjectNames();const visible=new Set(specification.visibleLabels||[]),captions=specification.captionOverrides||{};const view=JSON.parse(api.getViewProperties(1)),dx=10*view.invXscale,dy=10*view.invYscale;for(const name of names){try{const type=api.getObjectType(name),show=visible.size?visible.has(name):type==='point';api.setLabelVisible(name,false);if(type==='point')api.setPointSize(name,3);else if(['line','segment','ray','vector','circle','conic','polygon','function','curve'].includes(type))api.setLineThickness(name,3);if(show){let caption=captions[name]||name;caption=caption.replace(/^\\$|\\$$/g,'');const math=caption==='Γ'?'\\\\Gamma':caption==='ω'?'\\\\omega':/^[A-Za-z]+$/.test(caption)?'\\\\mathit{'+caption+'}':caption;const anchor=type==='point'?name:'Point('+name+',0.38)';const label='mcpLabel'+name;api.evalCommand(label+' = Text('+JSON.stringify(math).replaceAll(String.fromCharCode(92,92),String.fromCharCode(92))+', '+anchor+' + ('+dx+','+dy+'), true, true)');api.setLabelVisible(label,false);api.setFixed(label,true,false);api.setAuxiliary(label,true)}}catch(_){}}}

async function exportAs(format){if(!ready)return;try{if(format==='tikz'){if(typeof api.exportPGF!=='function')throw new Error('当前 GeoGebra 引擎不支持 TikZ 导出');setStatus('正在通过 Gikz 清洗…');const source=await callbackExport('tikz');if(!globalThis.Gikz)throw new Error('Gikz 未加载，已停止 TikZ 导出');const cleaned=Gikz.wrapStandalone(Gikz.cleanTikZCode(source));download(cleaned,'application/x-tex','tex')}else if(format==='xml'){download(api.getXML(),'application/xml','xml')}else if(format==='png'){download(api.getPNGBase64(2,false,144),'image/png','png',true)}else if(format==='html'){const base64=await callbackExport('ggb');const html=window.constructionTemplate.replace(/(<script id="construction-data" type="application\\/json">)[\\s\\S]*?(<\\/script>)/,'$1'+JSON.stringify({commands:[],ggbBase64:base64,theme:chosenTheme,visibleLabels:specification.visibleLabels||[],captionOverrides:specification.captionOverrides||{}})+'$2');download(html,'text/html','html')}else{const value=await callbackExport(format);download(value,format==='pdf'?'application/pdf':format==='ggb'?'application/vnd.geogebra.file':'image/svg+xml',format,format==='pdf'||format==='ggb')}setStatus('')}catch(error){setStatus(error.message||'导出失败',true)}}
const popupMenus=[[toggle,menu],[themeToggle,themeMenu]];
function closeMenus(){for(const [button,popup]of popupMenus){popup.classList.remove('open');button.setAttribute('aria-expanded','false')}}
for(const [button,popup]of popupMenus){button.addEventListener('click',()=>{const open=!popup.classList.contains('open');closeMenus();if(open){popup.classList.add('open');button.setAttribute('aria-expanded','true')}});button.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();closeMenus();popup.classList.add('open');button.setAttribute('aria-expanded','true');popup.querySelector('button').focus()}});popup.addEventListener('keydown',event=>{const items=[...popup.querySelectorAll('button')],index=items.indexOf(document.activeElement);if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();items[event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowDown'?1:items.length-1))%items.length].focus()}if(event.key==='Escape'){closeMenus();button.focus()}})}
menu.addEventListener('click',async event=>{const button=event.target.closest('[data-format]');if(!button)return;closeMenus();await exportAs(button.dataset.format)});
document.addEventListener('click',event=>{if(!event.target.closest('.menu-control'))closeMenus()});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenus()});
sidebarToggle.addEventListener('click',()=>{if(!ready)return;const camera=readCamera();sidebarOpen=!sidebarOpen;api.setPerspective(sidebarOpen?'AG':'G');api.showAlgebraInput(sidebarOpen);api.showToolBar(sidebarOpen);api.showMenuBar(sidebarOpen);sidebarToggle.setAttribute('aria-expanded',String(sidebarOpen));sidebarToggle.setAttribute('aria-label',sidebarOpen?'收起对象栏':'展开对象栏');sidebarToggle.title=sidebarOpen?'收起对象栏':'展开对象栏';sidebarToggle.querySelector('svg path').setAttribute('d',sidebarOpen?'M9 4v16m7-11-3 3 3 3':'M9 4v16m4-11 3 3-3 3');setSize(camera)});
// Initialize the native editing UI, then collapse it on load; starting with it disabled leaves lazy editor actions uninitialized.
window.startGeoGebra=()=>{window.constructionTemplate='<!doctype html>\\n'+document.documentElement.outerHTML;const width=Math.max(200,Math.round(host.clientWidth)),height=Math.max(200,Math.round(host.clientHeight));const applet=new GGBApplet({appName:'classic',width,height,disableAutoScale:true,showZoomButtons:false,borderColor:'transparent',language:'zh-CN',showToolBar:true,showMenuBar:true,showAlgebraInput:true,allowStyleBar:true,enableRightClick:true,showResetIcon:false,useBrowserForJS:false,preventFocus:true,enableLabelDrags:true,enableShiftDragZoom:true,...(specification.ggbBase64?{ggbBase64:specification.ggbBase64}:{}),appletOnLoad:async loaded=>{api=loaded;window.ggbApplet=api;try{api.setErrorDialogsActive(false);if(!specification.ggbBase64||(specification.commands||[]).length){api.setPerspective('G');api.setAxesVisible(false,false);api.setGridVisible(false);for(const command of specification.commands||[]){if(!api.evalCommand(command))throw new Error('GeoGebra 无法识别命令：'+command)}if((specification.commands||[]).length)await fitView();applyMcpDefaults()}api.setPerspective('G');api.showAlgebraInput(false);api.showToolBar(false);api.showMenuBar(false);api.setErrorDialogsActive(true);api.setAxesVisible(false,false);equalAxes();applyTheme();ready=true;sidebarToggle.disabled=false;window.ggbReady=true;status.hidden=true;resizeObserver=new ResizeObserver(()=>setSize());resizeObserver.observe(document.querySelector('.stage'));setSize()}catch(error){window.ggbError=error.message;setStatus(error.message,true)}}},true);applet.inject('ggb-element')};
setTimeout(()=>{if(!ready&&!window.ggbError){window.ggbError='GeoGebra 加载超时，请检查网络后刷新';setStatus(window.ggbError,true)}},30000);
})();
</script><script src="https://www.geogebra.org/apps/deployggb.js" onload="startGeoGebra()" onerror="window.ggbError='GeoGebra 加载失败';document.getElementById('status').className='error';document.getElementById('status').textContent=window.ggbError"></script>
</body></html>`;
}
