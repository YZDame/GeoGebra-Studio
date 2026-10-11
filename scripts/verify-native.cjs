const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const {GeoGebraInstance}=require('../dist/utils/geogebra-instance');
const {sceneFromXML,exportSource}=require('../dist/export/semantic');
const {constructionHtml}=require('../dist/export/html');
(async()=>{
  await fs.mkdir('output/verification',{recursive:true});
  const instance=new GeoGebraInstance({width:800,height:600});
  try {
    await instance.initialize();
    for(const cmd of ['A=(0,0)','B=(4,0)','C=(1,3)','M=Midpoint(A,B)','s=Segment(C,M)','c=Circle(A,B,C)']){
      const result=await instance.evalCommand(cmd);assert(result.success,JSON.stringify(result));
    }
    await instance.applyLatexCaptionDefaults(await instance.getAllObjectNames(), false);
    await instance.applyDefaultStyleSettings(await instance.getAllObjectNames(),2,2);
    await instance.debugEvaluate(() => {
      const api=window.ggbApplet;
      for(const name of api.getAllObjectNames()) { api.setLabelVisible(name,api.getObjectType(name)==='point');api.setColor(name,0,0,0); }
    });
    await instance.applyAutoZoom();
    const xml=await instance.getConstructionXML();
    assert(!(await instance.getAllObjectNames()).includes('a'),'Health checks must not add objects');
    const scene=sceneFromXML(xml);
    assert.equal(scene.objects.find(o=>o.name==='M').command.name,'Midpoint');
    await fs.writeFile('output/verification/live.xml',xml);
    for(const format of ['ggb','svg','pdf','png']){
      const value=await instance[{ggb:'exportGGB',svg:'exportSVG',pdf:'exportPDF',png:'exportPNG'}[format]]();
      const bytes=format==='svg'?value:Buffer.from(value,'base64');
      await fs.writeFile(`output/verification/live.${format}`,bytes);
    }
    for(const format of ['tikz','asymptote','tsqx']){
      const result=exportSource(scene,format);
      assert(result.complete);await fs.writeFile(`output/verification/live.${{tikz:'tex',asymptote:'asy',tsqx:'tsqx'}[format]}`,result.code);
    }
    const ggb=await instance.exportGGB();
    await fs.writeFile('output/verification/live.html',constructionHtml({title:'Live exported construction',ggbBase64:ggb}));
    // Capture actual render rather than treating successful compilation as visible proof.
    await instance.page.screenshot({path:'output/verification/live-browser.png',fullPage:true});
    // Round-trip the packed construction into a fresh applet.
    const second=new GeoGebraInstance({ggbBase64:ggb});
    try {await second.initialize();assert(await second.exists('M'));assert.equal(await second.getXcoord('M'),2);await second.loadGGB(ggb);assert(await second.exists('c')); }
    finally{await second.cleanup();}
    console.log('Native GeoGebra exports, semantic snapshot, and GGB round trip passed.');
  }finally{await instance.cleanup();}
})().catch(e=>{console.error(e);process.exitCode=1});
