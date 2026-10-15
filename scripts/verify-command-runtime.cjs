// Real-app regression: scripting side effects must not be interpreted as failures.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const puppeteer = require('puppeteer-core');
const {constructionHtml} = require('../dist/export/html');
const {resolveBrowser} = require('../dist/studio/browser');
(async () => {
  const output = path.resolve('output/verification/commands');
  await fs.mkdir(output, {recursive:true});
  const browser = await puppeteer.launch({headless:true, executablePath:resolveBrowser()});
  try {
    let page = await browser.newPage();
    await page.setViewport({width:1000,height:800});
    const scenarios = [{name:'reported-coordinates', spec:{commands:[
      'c=Circle((0,0),5)', 'A=Point(c)',
      'SetCoords(A, 3.715724127387, -2.208131000984)',
      'B=(0,0)', 's=Segment(A,B)', 'SetColor(s,"red")',
      'SetLineThickness(s,5)', 'SetPointSize(A,5)',
      'SetVisibleInView(B,1,false)', 'ZoomIn(-11,-6.5,11,6.5)',
    ],visibleLabels:['A']} }];
    for (const [name,file] of [['tangent','examples/circle-tangency.html'], ['desargues','constructions/desargues.html']]) {
      try {
        const html = await fs.readFile(file,'utf8');
        const spec = JSON.parse(html.match(/<script id="construction-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
        scenarios.push({name,spec});
      } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    for (const {name,spec} of process.argv.includes('--invalid-only') ? [] : scenarios) {
      console.log('Checking '+name);
      const html = constructionHtml(spec);
      await fs.writeFile(path.join(output,name+'.html'),html);
      await page.goto('about:blank');
      await page.setContent(html);
      await page.waitForFunction('window.ggbReady || window.ggbError',{timeout:90000});
      const state = await page.evaluate(()=>({error:ggbError,...geogebraStudio}));
      assert.equal(state.error,null,JSON.stringify(state));
      assert.equal(state.completedCommands,spec.commands.length);
      assert.equal(state.checks.undefinedVisibleObjects.length,0);
      if (name==='reported-coordinates') {
        const result=await page.evaluate(()=>({
          x:ggbApplet.getXcoord('A'), y:ggbApplet.getYcoord('A'),
          color:ggbApplet.getColor('s'), thickness:ggbApplet.getLineThickness('s'),
          pointSize:ggbApplet.getPointSize('A'), hidden:!ggbApplet.getVisible('B'),
          view:JSON.parse(ggbApplet.getViewProperties(1)),
        }));
        assert(Math.abs(result.x/result.y-3.715724127387/-2.208131000984)<1e-7);
        assert(Math.abs(result.x**2+result.y**2-25)<1e-7);
        assert.equal(result.color.toLowerCase(),'#ff0000');
        assert.equal(result.thickness,5); assert.equal(result.pointSize,5); assert(result.hidden);
        assert(result.view.width*result.view.invXscale>=22-1e-6);
      }
      await new Promise(r=>setTimeout(r,1500));
      await page.screenshot({path:path.join(output,name+'.png')});
      const snapshot = await page.evaluate(()=>geogebraStudio.snapshot());
      assert.equal(Buffer.from(snapshot.ggbBase64,'base64').subarray(0,2).toString(),'PK');
      assert((await page.evaluate(()=>ggbApplet.getPNGBase64(1,false,96))).length>100);
      for (const [format,call] of [['svg','exportSVG'],['pdf','exportPDF'],['tex','exportPGF']]) {
        const value = await page.evaluate((call)=>new Promise((resolve,reject)=>{
          const timer=setTimeout(()=>reject(Error('Export timeout: '+call)),20000);
          const done=value=>{clearTimeout(timer);resolve(value)};
          if(call==='exportPDF')ggbApplet[call](1,done);else ggbApplet[call](done);
        }),call);
        assert(value.length>50,format);
        await fs.writeFile(path.join(output,name+'.'+format),format==='pdf'?Buffer.from(value,'base64'):value);
      }
      console.log(name+': commands, geometry checks, PNG/SVG/PDF/PGF/GGB passed');
    }
    for (const command of ['A=(', 'SetCoords(Missing,1,2)','SetCoords(A,unknown,2)']) {
      console.log('Checking invalid input: '+command);
      await page.close();
      page = await browser.newPage();
      await page.setContent(constructionHtml({commands:['A=(0,0)',command]}));
      await page.waitForFunction('window.ggbReady || window.ggbError',{timeout:90000});
      assert(await page.evaluate(()=>Boolean(ggbError)), 'Invalid command was accepted: '+command);
      assert.equal(await page.evaluate(()=>geogebraStudio.failedCommand.index),2);
      assert.equal(await page.$eval('#download-toggle',b=>b.disabled),true);
      console.log('Rejected with index 2: '+command);
    }
    console.log('Invalid commands still fail with exact index and exports disabled.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
