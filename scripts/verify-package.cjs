const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
(async()=>{
 const report=require('../release/package-report.json');
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),'geogebra-clean-install-'));
 const env={...process.env,GEOGEBRA_STUDIO_HOME:path.join(temp,'runtime')};delete env.GIKZ_CLI;
 try{
  await fs.writeFile(path.join(temp,'package.json'),'{"private":true}');
  execFileSync('npm',['install','--ignore-scripts','--omit=dev','--no-audit','--no-fund',path.resolve('release',report.npm)],{cwd:temp,env,stdio:'pipe'});
  const root=path.join(temp,'node_modules/@lydt/geogebra-studio');
  assert(!root.includes('_npx'));assert(!await fs.access(path.join(temp,'Gikz')).then(()=>true,()=>false));
  const {cleanWithGikz}=require(path.join(root,'dist/export/gikz.js'));
  assert((await cleanWithGikz('\\begin{tikzpicture}\\draw (0,0) circle (1cm);\\end{tikzpicture}',{standalone:true})).includes('documentclass'));
  // Verify the unpacked plugin itself, without dependency installation or lifecycle scripts.
  const unpacked=path.join(temp,'unpacked');await fs.mkdir(unpacked);
  execFileSync('tar',['-xzf',path.resolve('release',report.npm),'-C',unpacked]);
  const plugin=path.join(unpacked,'package');
  await assert.rejects(fs.access(path.join(plugin,'node_modules')));
  const spec=path.join(temp,'diagram.json');
  await fs.writeFile(spec,JSON.stringify({commands:['A=(0,0)'],filename:'unpacked.html'}));
  const data=JSON.parse(execFileSync(process.execPath,[path.join(plugin,'dist/cli.js'),'generate','--input',spec,'--workspace',temp],{cwd:temp,env,encoding:'utf8'}));
  assert.equal(data.execution,'viewer');assert.equal(data.engineVerified,false);
  assert((await fs.readFile(data.filename,'utf8')).includes('geogebraStudio'));
  assert.equal(await fs.access(path.join(plugin,'mcp.json')).then(()=>true,()=>false),false);
  console.log(JSON.stringify({cleanInstall:true,unpackedDependencyFreeGenerator:true,defaultMcpServers:0,chromeRequired:false,version:report.version}));
 }finally{if(process.env.KEEP_STUDIO_INSTALL==='1')console.log('Retained clean install: '+temp);else await fs.rm(temp,{recursive:true,force:true})}
})().catch(e=>{console.error(e);process.exitCode=1});
