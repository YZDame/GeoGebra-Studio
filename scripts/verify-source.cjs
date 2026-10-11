const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const directory=path.resolve('output/verification');
const run=(command,args,options={})=>execFileSync(command,args,{cwd:directory,encoding:'utf8',stdio:['pipe','pipe','pipe'],...options});
try{
  // The fixture has A=(0,0), B=(4,0), C=(1,3): circumcenter must be (2,1).
  const source=fs.readFileSync(path.join(directory,'semantic.tex'),'utf8');
  const probe='\\path let \\p1=(g5center) in \\pgfextra{\\typeout{GGB_CENTER_X=\\x1}\\typeout{GGB_CENTER_Y=\\y1}};\n';
  fs.writeFileSync(path.join(directory,'semantic-checked.tex'),source.replace('\\end{tikzpicture}',probe+'\\end{tikzpicture}'));
  const log=run('pdflatex',['-interaction=nonstopmode','-halt-on-error','semantic-checked.tex']);
  const x=Number(log.match(/GGB_CENTER_X=([-\d.]+)pt/)?.[1]);
  const y=Number(log.match(/GGB_CENTER_Y=([-\d.]+)pt/)?.[1]);
  assert(Math.abs(x-56.9055)<0.05 && Math.abs(y-28.45275)<0.05,`TikZ circumcenter has wrong units: (${x},${y})pt`);
  run('pdflatex',['-interaction=batchmode','-halt-on-error','semantic.tex']);
  const generated=run('tsqx',['-p'],{input:fs.readFileSync(path.join(directory,'semantic.tsqx'),'utf8')});
  fs.writeFileSync(path.join(directory,'semantic-tsqx.asy'),generated);
  run('asy',['-f','pdf','-o','semantic-tsqx','semantic-tsqx.asy']);
  run('asy',['-f','pdf','-o','semantic-asy','semantic.asy']);
  console.log('TikZ circumcenter coordinates verified; TikZ, Asymptote, and TSQX compiled to PDF.');
}catch(e){console.error(e.stdout||e.stderr||e);process.exitCode=1;}
