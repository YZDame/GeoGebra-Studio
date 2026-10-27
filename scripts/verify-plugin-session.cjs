// Test real Codex discovery/tool dispatch without starting a model turn or delegating work.
const {spawn,execFileSync}=require('node:child_process');
const readline=require('node:readline');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');

(async()=>{
 if(!process.env.CODEX_HOME)throw Error('Set CODEX_HOME to the isolated home populated by plugin installation');
 const child=spawn('codex',['app-server','--stdio'],{stdio:['pipe','pipe','pipe'],env:process.env});
 const pending=new Map();
 let next=0;
 const lines=readline.createInterface({input:child.stdout});
 lines.on('line',line=>{
  try{
   const value=JSON.parse(line);
   if(value.method==='mcpServerStatus/updated')console.log('MCP update:',JSON.stringify({name:value.params?.name,status:value.params?.status,error:value.params?.error,failureReason:value.params?.failureReason}));
   if(pending.has(value.id)){
    const p=pending.get(value.id);pending.delete(value.id);clearTimeout(p.timer);
    value.error?p.reject(Error(JSON.stringify(value.error))):p.resolve(value.result);
   }
  }catch{}
 });
 const call=(method,params,timeout=90000)=>new Promise((resolve,reject)=>{
  const id=++next;
  const timer=setTimeout(()=>{pending.delete(id);reject(Error(method+' timed out'));},timeout);
  pending.set(id,{resolve,reject,timer});
  child.stdin.write(JSON.stringify({id,method,params})+String.fromCharCode(10));
 });
 child.stderr.on('data',()=>{});
 try{
  await call('initialize',{clientInfo:{name:'studio-plugin-acceptance',version:'1'},capabilities:{experimentalApi:true}});
  child.stdin.write(JSON.stringify({method:'initialized'})+String.fromCharCode(10));
  const skills=await call('skills/list',{cwds:[process.cwd()],forceReload:true});
  const listedSkills=skills.data.flatMap(entry=>entry.skills).filter(s=>s.pluginId==='geogebra-studio@geogebra-studio'&&s.enabled!==false);
  console.log('Skills:',JSON.stringify(listedSkills.map(s=>({name:s.name,pluginId:s.pluginId,enabled:s.enabled}))));
  for(const name of ['geogebra-studio'])assert(listedSkills.some(s=>s.name===name||s.name.endsWith(':'+name)),'Missing installed plugin skill '+name);
  const installed=JSON.parse(execFileSync('codex',['plugin','list','--json'],{encoding:'utf8',env:process.env}));
  assert(installed.installed.some(p=>p.name==='geogebra-studio'&&p.enabled),'Plugin is not installed and enabled in Codex');
  const session=await call('thread/start',{cwd:process.cwd(),ephemeral:true,approvalPolicy:'never',sandbox:'read-only'});
  const threadId=session.thread.id;
  const inventory=await call('mcpServerStatus/list',{threadId});
  assert(!inventory.data.some(s=>Object.values(s.tools||{}).some(t=>t.name==='geogebra_build_artifact')),
    'Default plugin unexpectedly registered GeoGebra MCP');
  const skill=listedSkills.find(s=>s.name==='geogebra-studio'||s.name.endsWith(':geogebra-studio'));
  assert(skill.path,'Installed skill path is required to locate the bundled generator');
  const pluginRoot=path.resolve(path.dirname(skill.path),'../..');
  const metadata=JSON.parse(await fs.readFile(path.join(pluginRoot,'package.json'),'utf8'));
  if(process.env.STUDIO_EXPECTED_VERSION)assert.equal(metadata.version,process.env.STUDIO_EXPECTED_VERSION);
  const spec=path.resolve('output/verification/plugin-generator.json');
  const filename='output/verification/plugin-generated.html';
  await fs.mkdir(path.dirname(spec),{recursive:true});await fs.rm(filename,{force:true});
  await fs.writeFile(spec,JSON.stringify({commands:['A=(0,0)','B=(4,0)','c=Circle(A,B)'],filename}));
  const generated=JSON.parse(execFileSync(process.execPath,[path.join(path.dirname(skill.path),'scripts/geogebra-studio.cjs'),'generate','--input',spec,'--workspace',process.cwd()],{encoding:'utf8'}));
  assert.equal(generated.engineVerified,false);await fs.access(generated.filename);
  const report={realPluginSession:true,installedSkills:1,mcp:false,version:metadata.version,
    generator:generated.filename,modelTurn:false,renderVerified:false};
  await fs.mkdir('output/verification',{recursive:true});
  await fs.writeFile(process.env.STUDIO_REPORT_FILE||'output/verification/plugin-session.json',JSON.stringify(report,null,2)+String.fromCharCode(10));
  console.log(JSON.stringify(report));
 }finally{
  for(const p of pending.values())clearTimeout(p.timer);
  child.kill();lines.close();
 }
})().catch(e=>{console.error(e);process.exitCode=1});
