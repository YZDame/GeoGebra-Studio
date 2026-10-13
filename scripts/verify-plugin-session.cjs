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
  for(const name of ['geogebra-construct','geogebra-setup','geometry-export'])assert(listedSkills.some(s=>s.name===name||s.name.endsWith(':'+name)),'Missing installed plugin skill '+name);
  const installed=JSON.parse(execFileSync('codex',['plugin','list','--json'],{encoding:'utf8',env:process.env}));
  assert(installed.installed.some(p=>p.name==='geogebra-studio'&&p.enabled),'Plugin is not installed and enabled in Codex');
  const session=await call('thread/start',{cwd:process.cwd(),ephemeral:true,approvalPolicy:'never',sandbox:'read-only'});
  const threadId=session.thread.id;
  let inventory;
  for(let attempt=0;attempt<15;attempt++){
   inventory=await call('mcpServerStatus/list',{threadId});
   if(JSON.stringify(inventory).includes('geogebra_build_artifact'))break;
   await new Promise(resolve=>setTimeout(resolve,1000));
  }
  const server=inventory.data.find(s=>Object.values(s.tools||{}).some(t=>t.name==='geogebra_build_artifact'));
  assert(server,'Installed plugin MCP tool discovery failed: '+JSON.stringify(inventory));
  const source='\\begin{tikzpicture}\\draw (0,0) circle (1cm);\\end{tikzpicture}';
  const result=await call('mcpServer/tool/call',{threadId,server:server.name,tool:'geogebra_clean_tikz',arguments:{source,standalone:true}});
  assert(!result.isError&&JSON.stringify(result).includes('tikzpicture'));
  const info=await call('mcpServer/tool/call',{threadId,server:server.name,tool:'server_info',arguments:{}});
  assert(!info.isError);
  const serverInfo=info.structuredContent||JSON.parse(info.content.find(c=>c.type==='text').text);
  if(process.env.STUDIO_EXPECTED_VERSION)assert.equal(serverInfo.version,process.env.STUDIO_EXPECTED_VERSION);
  const report={realPluginSession:true,installedSkills:3,server:server.name,version:serverInfo.version,tool:'geogebra_clean_tikz',modelTurn:false};
  if(process.env.STUDIO_VERIFY_ARTIFACT==='1'){
   const filename='output/verification/registry-studio/tangent-construction.html';
   await fs.rm(filename,{force:true});await fs.rm(filename.replace('.html','.preview.png'),{force:true});
   const artifact=await call('mcpServer/tool/call',{threadId,server:server.name,tool:'geogebra_build_artifact',arguments:{...require('../examples/tangent-construction.json'),workspace:process.cwd(),filename}},180000);
   assert(!artifact.isError,'Registry plugin artifact failed: '+JSON.stringify(artifact));
   const data=artifact.structuredContent||JSON.parse(artifact.content.find(c=>c.type==='text').text);
   assert(data.engineVerified&&data.packedGgbVerified&&data.renderVerified);
   assert.equal(data.filename,path.resolve(filename),'Artifact must be saved in the user project, not the installed plugin cache');
   await fs.access(data.filename);await fs.access(data.previewFilename);
   report.artifact={filename:data.filename,previewFilename:data.previewFilename,renderVerified:true};
  }
  await fs.mkdir('output/verification',{recursive:true});
  await fs.writeFile(process.env.STUDIO_REPORT_FILE||'output/verification/plugin-session.json',JSON.stringify(report,null,2)+String.fromCharCode(10));
  console.log(JSON.stringify(report));
 }finally{
  for(const p of pending.values())clearTimeout(p.timer);
  child.kill();lines.close();
 }
})().catch(e=>{console.error(e);process.exitCode=1});
