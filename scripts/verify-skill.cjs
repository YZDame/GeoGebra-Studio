// Copy ONLY the installed Skill folder into a clean directory and run it without node_modules.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
const {execFileSync,spawnSync}=require('node:child_process');
(async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'geogebra-portable-skill-'));
 try{
  const skill=path.join(dir,'skill'),workspace=path.join(dir,'project');
  await fs.cp(path.resolve('skills/geogebra-studio'),skill,{recursive:true});
  await fs.mkdir(workspace);
  const cli=path.join(skill,'scripts/geogebra-studio.cjs');
  const env={...process.env,NODE_PATH:'',NODE_OPTIONS:'',PUPPETEER_EXECUTABLE_PATH:'/nonexistent'};
  const run=(args)=>JSON.parse(execFileSync(process.execPath,[cli,...args],{cwd:workspace,env,encoding:'utf8'}));
  const doctor=run(['doctor']);assert.equal(doctor.mcpRequired,false);assert.equal(doctor.chromeRequired,false);
  const spec=path.join(workspace,'figure.json');
  await fs.writeFile(spec,JSON.stringify({commands:['A=(0,0)','B=(4,0)','c=Circle(A,B)'],filename:'figure.html'}));
  const result=run(['generate','--input',spec,'--workspace',workspace]);
  assert.equal(result.success,true);assert.equal(result.engineVerified,false);
  const html=await fs.readFile(result.filename,'utf8');
  assert(html.includes('deployggb.js'));assert(html.includes('id="gikz-browser"'));
  assert(html.includes('class="header-actions"'));assert(html.includes('id="sidebar-toggle"'));
  assert(html.indexOf('id="sidebar-toggle"')<html.indexOf('<section class="stage"'));
  assert.equal(spawnSync(process.execPath,[cli,'generate','--input',spec,'--workspace',workspace],{cwd:workspace,env}).status,1,'must not overwrite existing HTML');
  const xml=path.join(workspace,'figure.xml');
  const p=(name,x,y)=>'<element label="'+name+'" type="point"><coords x="'+x+'" y="'+y+'" z="1"/><show object="true" label="true"/></element>';
  await fs.writeFile(xml,'<geogebra><construction>'+p('A',0,0)+p('B',4,0)+'<command name="Midpoint"><input a0="A" a1="B"/><output a0="M"/></command>'+p('M',2,0)+'</construction></geogebra>');
  for(const [format,out] of [['tsqx','figure.tsqx'],['asymptote','figure.asy']]){
   const result=run(['export','--input',xml,'--format',format,'--workspace',workspace,'--output',out]);
   assert(result.success);assert((await fs.readFile(result.filename,'utf8')).includes('midpoint'));
  }
  const pgf=path.join(workspace,'figure.pgf');
  await fs.writeFile(pgf,'\\begin{tikzpicture}\\draw (0,0) circle (1cm);\\end{tikzpicture}');
  const tikz=run(['export','--input',pgf,'--format','tikz','--workspace',workspace,'--output','figure.tex']);
  assert((await fs.readFile(tikz.filename,'utf8')).includes('tikzpicture'));
  console.log(JSON.stringify({portableSkill:true,noNodeModules:true,formats:['html','tsqx','asymptote','tikz'],mcp:false}));
 }finally{await fs.rm(dir,{recursive:true,force:true})}
})().catch(e=>{console.error(e);process.exitCode=1});
