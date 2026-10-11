import { App } from '@modelcontextprotocol/ext-apps';
const app = new App({name:'GeoGebra construction preview',version:'0.2.0'},{});
const frame = document.querySelector<HTMLIFrameElement>('#preview')!;
const status = document.querySelector<HTMLElement>('#status')!;
app.addEventListener('toolresult', result => {
  const data=result.structuredContent as {html?:string;error?:string}|undefined;
  if(result.isError || !data?.html){status.textContent=data?.error||'No construction HTML returned.';return;}
  frame.srcdoc=data.html;
  status.textContent='Interactive GeoGebra preview. The applet requires internet access.';
});
app.connect().catch(e=>{status.textContent='Host connection failed: '+String(e);});
