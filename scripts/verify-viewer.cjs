const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const puppeteer=require('puppeteer-core').default;
const {constructionHtml}=require('../dist/export/html');
const chooseTheme=async(page,value)=>{const [name,mode]=value.split(':');await page.click('#theme-toggle');await page.click('[data-theme="'+name+'"]');if(await page.$eval('#mode-toggle',b=>b.getAttribute('aria-pressed'))!==String(mode==='1'))await page.click('#mode-toggle')};
const settle=page=>page.waitForFunction(()=>{if(!window.ggbReady)return false;const v=JSON.parse(ggbApplet.getViewProperties(1));return Math.abs(v.invXscale/v.invYscale-1)<1e-6},{timeout:10000});
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:process.env.PUPPETEER_EXECUTABLE_PATH});
 const dir=path.resolve(process.env.STUDIO_VIEWER_OUTPUT||'output/verification/viewer');await fs.mkdir(dir,{recursive:true});
 try{
  const page=await browser.newPage();await page.setViewport({width:1000,height:800});
  await page.setContent(await fs.readFile(process.env.STUDIO_HTML_FIXTURE||'../tangent-construction.html','utf8'));
  await page.waitForFunction('window.ggbReady || window.ggbError',{timeout:60000});assert.equal(await page.evaluate(()=>ggbError),null);await settle(page);
  for(const viewport of [{width:1000,height:800},{width:1500,height:900},{width:480,height:850},{width:1000,height:800}]){
   await page.setViewport(viewport);await new Promise(r=>setTimeout(r,800));await settle(page);
   const metrics=await page.evaluate(()=>{const host=document.querySelector('#ggb-element').getBoundingClientRect(),canvas=document.querySelector('.EuclidianPanel canvas').getBoundingClientRect();return{host:{width:host.width,height:host.height},canvas:{width:canvas.width,height:canvas.height},view:JSON.parse(ggbApplet.getViewProperties(1))}});
   assert(Math.abs(metrics.host.width-metrics.canvas.width)<5,JSON.stringify(metrics));assert(Math.abs(metrics.host.height-metrics.canvas.height)<5,JSON.stringify(metrics));console.log(viewport,metrics);
  }
  const xml=await page.evaluate(()=>ggbApplet.getXML());assert(xml.includes('<isLaTeX val="true"/>'));assert(xml.includes('mathit{A}'));
  assert.equal(await page.evaluate(()=>ggbApplet.isMoveable('A')),true);
  const samples=await page.evaluate(()=>{const results=[];for(let k=0;k<24;k++){const angle=k*Math.PI/12;ggbApplet.setCoords('A',5*Math.cos(angle),5*Math.sin(angle));for(const n of ['B','C']){const x=ggbApplet.getXcoord(n),y=ggbApplet.getYcoord(n),ax=ggbApplet.getXcoord('A'),ay=ggbApplet.getYcoord('A');results.push({k,n,radius:x*x+y*y,separation:Math.hypot(x-ax,y-ay),tangentDistance:Math.abs((x-ax)*(0-ay)-(y-ay)*(3-ax))/Math.hypot(x-ax,y-ay)})}}ggbApplet.setCoords('A',5,0);return results});
  for(const point of samples){assert(Math.abs(point.radius-25)<1e-7,JSON.stringify(point));assert(point.separation>1e-4,JSON.stringify(point));assert(Math.abs(point.tangentDistance-1.6)<1e-7,JSON.stringify(point))}

  const toolbar=await page.evaluate(()=>{const header=document.querySelector('header').getBoundingClientRect(),button=document.querySelector('#sidebar-toggle').getBoundingClientRect(),stage=document.querySelector('.stage').getBoundingClientRect(),download=document.querySelector('#download-toggle').getBoundingClientRect();return {buttonAboveCanvas:button.bottom<=stage.top,buttonLeft:button.left<download.left,headerContains:button.top>=header.top&&button.bottom<=header.bottom};});assert(toolbar.buttonAboveCanvas&&toolbar.buttonLeft&&toolbar.headerContains,JSON.stringify(toolbar));
  assert.equal(await page.$$eval('#theme-menu [data-theme]',xs=>xs.length),9);
  const sizes=await page.$$eval('header .control-button',els=>els.map(e=>({height:e.getBoundingClientRect().height,top:e.getBoundingClientRect().top})));assert(sizes.every(s=>s.height===sizes[0].height&&s.top===sizes[0].top),JSON.stringify(sizes));
  for(const theme of ['default:0','ayu:1','catppuccin:0','nord:1']){
   await chooseTheme(page,theme);await new Promise(r=>setTimeout(r,150));const colors=await page.evaluate(()=>({paper:getComputedStyle(document.documentElement).getPropertyValue('--paper'),xml:ggbApplet.getXML().match(/<bgColor[^>]+>/)?.[0]}));assert(colors.xml.includes('r="'+parseInt(colors.paper.slice(1,3),16)+'"'),JSON.stringify(colors));console.log(theme,colors);
  }
  await chooseTheme(page,'default:0');await page.screenshot({path:path.join(dir,'light.png')});
  await chooseTheme(page,'ayu:1');await page.screenshot({path:path.join(dir,'dark.png')});
  await chooseTheme(page,'default:0');
  await page.click('#sidebar-toggle');await new Promise(r=>setTimeout(r,700));await settle(page);
  const sidebar=await page.evaluate(()=>({expanded:document.getElementById('sidebar-toggle').getAttribute('aria-expanded'),width:JSON.parse(ggbApplet.getViewProperties(1)).width,text:document.querySelector('.algebraView')?.innerText}));assert.equal(sidebar.expanded,'true');assert(sidebar.width<800,JSON.stringify(sidebar));
  await page.screenshot({path:path.join(dir,'sidebar.png')});
  await page.click('#sidebar-toggle');await new Promise(r=>setTimeout(r,700));await settle(page);assert.equal(await page.$eval('#sidebar-toggle',b=>b.getAttribute('aria-expanded')),'false');
  await page.click('#theme-toggle');await page.screenshot({path:path.join(dir,'theme-menu.png')});await page.keyboard.press('Escape');
  await page.click('#download-toggle');await page.screenshot({path:path.join(dir,'download-menu.png')});await page.keyboard.press('Escape');
  const session=await page.createCDPSession();await session.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:dir});
  for(const format of ['ggb','png','svg','tikz','pdf','xml','html']){
   const file=path.join(dir,'construction.'+(format==='tikz'?'tex':format));await fs.rm(file,{force:true});await page.click('#download-toggle');await page.click(`[data-format="${format}"]`);
   let data;for(let i=0;i<150;i++){try{data=await fs.readFile(file);if(data.length>50)break}catch{}await new Promise(r=>setTimeout(r,100))}assert(data?.length>50,'Missing '+format);
   if(format==='tikz'){const raw=await page.evaluate(()=>new Promise(resolve=>ggbApplet.exportPGF(resolve)));const cleaned=await require('../dist/export/gikz').cleanWithGikz(raw,{standalone:true});assert.equal(data.toString().trim(),cleaned.trim());assert(data.toString().includes('\\Gamma'));assert(data.toString().includes('circle (5cm)'));assert(data.toString().includes('circle (1.6cm)'));assert.equal((data.toString().match(/plot\(/g)||[]).length,2);assert.equal((data.toString().match(/\\coordinate /g)||[]).length,5);assert(!data.toString().includes('definecolor'));}
   if(format==='ggb')assert.equal(data.subarray(0,2).toString(),'PK');if(format==='pdf')assert.equal(data.subarray(0,5).toString(),'%PDF-');if(format==='svg')assert(data.toString().includes('<svg'));console.log(format,data.length);
  }

  const saved=await fs.readFile(path.join(dir,'construction.html'),'utf8');assert(!saved.includes('class="GeoGebraFrame"'));
  await page.evaluate(()=>ggbApplet.setColor('omega',190,40,90));await chooseTheme(page,'ayu:1');assert.equal((await page.evaluate(()=>ggbApplet.getColor('omega'))).toLowerCase(),'#be285a');await chooseTheme(page,'default:0');
  const styledGgb=await page.evaluate(()=>new Promise(resolve=>ggbApplet.getBase64(resolve)));
  const packed=saved.match(/<script id="construction-data" type="application\/json">([\s\S]*?)<\/script>/)[1],styledPayload=JSON.parse(packed);styledPayload.ggbBase64=styledGgb;const styledHtml=saved.replace(packed,JSON.stringify(styledPayload));
  const reopened=await browser.newPage();await reopened.setViewport({width:800,height:700});await reopened.setContent(styledHtml);await reopened.waitForFunction('window.ggbReady || window.ggbError',{timeout:60000});assert.equal(await reopened.evaluate(()=>ggbError),null);await settle(reopened);
  assert.equal((await reopened.evaluate(()=>ggbApplet.getColor('omega'))).toLowerCase(),'#be285a');
  assert.equal(await reopened.$$eval('#theme-menu [data-theme]',xs=>xs.length),9);
  assert.equal(await reopened.evaluate(()=>ggbApplet.isMoveable('A')),true);assert((await reopened.evaluate(()=>ggbApplet.getXML())).includes('mathit{A}'));
  const nativeErrors=[];reopened.on('pageerror',e=>nativeErrors.push(e.message));
  await reopened.click('#sidebar-toggle');await new Promise(r=>setTimeout(r,700));
  await reopened.click('.avItem .elemText',{clickCount:2});
  for(let i=0;i<50;i++)await reopened.keyboard.press('ArrowRight');for(let i=0;i<100;i++)await reopened.keyboard.press('Backspace');
  await reopened.keyboard.type('Gamma: x^2');await reopened.keyboard.press('ArrowRight');await reopened.keyboard.type('+y^2');await reopened.keyboard.press('ArrowRight');await reopened.keyboard.type('=36');
  await reopened.click('.KeyBoardButton[aria-label="Enter"]');
  await reopened.waitForFunction(()=>ggbApplet.getDefinitionString('Gamma').includes('36'),{timeout:15000});assert.equal(nativeErrors.length,0,nativeErrors.join('; '));
  assert(Math.abs(await reopened.evaluate(()=>ggbApplet.getXcoord('A'))-6)<1e-6);
  const editedRaw=await reopened.evaluate(()=>new Promise(resolve=>ggbApplet.exportPGF(resolve)));
  const editedClean=await reopened.evaluate(raw=>Gikz.wrapStandalone(Gikz.cleanTikZCode(raw)),editedRaw);
  assert.equal(editedClean.trim(),(await require('../dist/export/gikz').cleanWithGikz(editedRaw,{standalone:true})).trim());
  assert(editedClean.includes('circle (6cm)'));assert(!editedClean.includes('definecolor'));
  console.log('Mandatory browser Gikz equals CLI output, including native user edits.');
  console.log('Responsive equal axes, native LaTeX, moving geometry, themes, seven downloads and native sidebar and packed GGB reopen passed.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
