const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const {sceneFromXML,exportSource}=require('../dist/export/semantic');
const {constructionHtml}=require('../dist/export/html');
const {saveText}=require('../dist/export/files');
const {cleanWithGikz}=require('../dist/export/gikz');
const point=(label,x,y,visible=true)=>`<element type="point" label="${label}"><show object="${visible}" label="true"/><coords x="${x}" y="${y}" z="1"/><caption val="$${label}$"/><objColor r="0" g="0" b="0"/><pointSize val="2"/></element>`;
const xml=`<geogebra><construction>${point('A',0,0)}${point('B',4,0)}${point('C',1,3)}<command name="Midpoint"><input a0="A" a1="B"/><output a0="M"/></command>${point('M',2,0)}<command name="Segment"><input a0="C" a1="M"/><output a0="s"/></command><element type="segment" label="s"><show object="true" label="false"/></element><command name="Circle"><input a0="A" a1="B" a2="C"/><output a0="c"/></command><element type="conic" label="c"><show object="true" label="false"/></element></construction></geogebra>`;
(async()=>{
  await fs.mkdir('output/verification',{recursive:true});
  const scene=sceneFromXML(xml);
  assert.equal(scene.objects.find(o=>o.name==='M').command.name,'Midpoint');
  for(const [format,extension] of [['tikz','tex'],['asymptote','asy'],['tsqx','tsqx']]){
    const result=exportSource(scene,format);
    assert(result.complete);
    // Semantic TikZ remains an internal subset check; final TikZ exports use native PGF + Gikz.
    if(format!=='tikz')await fs.writeFile(`output/verification/semantic.${extension}`,result.code);
  }
  const unsupported=sceneFromXML(xml.replace('name="Midpoint"','name="Intersect"'));
  assert.throws(()=>exportSource(unsupported,'tikz'),/requires review/);
  const draft=exportSource(unsupported,'tikz',false);
  assert.deepEqual(draft.coordinateFallbacks,['M']);assert.equal(draft.complete,false);
  assert.throws(()=>sceneFromXML('<!DOCTYPE x><geogebra/>'),/forbidden/);
  const html=constructionHtml({title:'</title><script>alert(1)</script>',commands:['A=(0,0)','Text("</script>")']});
  assert(!html.includes('</title><script>alert'));
  assert(html.includes('\\u003c/script>'));
  const marker=path.resolve('output/verification/symlink');
  await fs.rm(marker,{force:true});await fs.symlink('/private/tmp',marker);
  await assert.rejects(saveText('output/verification/symlink/escape.txt','x'),/symbolic/);
  await fs.rm(marker);
  await assert.rejects(saveText('../escape.txt','x'),/outside/);
  await fs.writeFile('output/verification/triangle.xml',xml);
  await fs.writeFile('output/verification/triangle.html',constructionHtml({title:'Triangle and midpoint',commands:['A=(0,0)','B=(4,0)','C=(1,3)','M=Midpoint(A,B)','s=Segment(C,M)','c=Circle(A,B,C)']}));
  {const code=await cleanWithGikz(xml,{standalone:true});assert(code.includes('tikzpicture'));await fs.writeFile('output/verification/gikz.tex',code);}
  console.log('Export invariants passed; sources are in output/verification.');
})().catch(e=>{console.error(e);process.exitCode=1});
