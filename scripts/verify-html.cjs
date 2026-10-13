const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const puppeteer=require('puppeteer-core').default;
const {constructionHtml}=require('../dist/export/html');
(async()=>{
  const directory=path.resolve('output/verification/downloads');await fs.mkdir(directory,{recursive:true});
  for(const f of ['ggb','png','svg','pdf','xml','html'])await fs.rm(path.join(directory,'construction.'+f),{force:true});
  const browser=await puppeteer.launch({headless:true,executablePath:process.env.PUPPETEER_EXECUTABLE_PATH});
  try {
    const page=await browser.newPage();await page.setViewport({width:1000,height:1000});
    await page.setContent(constructionHtml(require('../examples/triangle.json')));
    await page.waitForFunction('window.ggbReady || window.ggbError',{timeout:60000});
    assert.equal(await page.evaluate(()=>window.ggbError),null);
    const session=await page.createCDPSession();
    await session.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:directory});
    await page.evaluate(()=>window.ggbApplet.setCoords('A',-0.5,0));
    await page.click('[data-format="fit"]');
    await page.waitForFunction("document.getElementById('status').textContent.includes('equal axis')");
    for(const format of ['ggb','png','svg','pdf','xml','html']){
      await page.click(`[data-format="${format}"]`);
      const filename=path.join(directory,'construction.'+format);
      let bytes;
      for(let k=0;k<200;k++){try{bytes=await fs.readFile(filename);if(bytes.length>50)break;}catch{}await new Promise(r=>setTimeout(r,100));}
      assert(bytes?.length>50,`${format} download failed: ${await page.$eval('#status',el=>el.textContent)}`);
      if(format==='ggb')assert.equal(bytes.subarray(0,2).toString(),'PK');
      if(format==='pdf')assert.equal(bytes.subarray(0,5).toString(),'%PDF-');
      if(format==='svg')assert(bytes.toString().includes('<svg'));
    }
    await page.screenshot({path:'output/verification/html-browser.png',fullPage:true});
    const html=await fs.readFile(path.join(directory,'construction.html'),'utf8');
    assert(!html.includes('class="GeoGebraFrame"'),'Saved HTML must not contain a previous rendered applet');
    const reopened=await browser.newPage();await reopened.setContent(html);
    await reopened.waitForFunction('window.ggbReady || window.ggbError',{timeout:60000});
    assert.equal(await reopened.evaluate(()=>window.ggbError),null);
    assert.equal(await reopened.evaluate(()=>window.ggbApplet.getXcoord('A')),-0.5);
    console.log('Browser downloads passed for GGB/PNG/SVG/PDF/XML/HTML; HTML reopened with the edited point.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
