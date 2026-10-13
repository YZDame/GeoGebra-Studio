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
  const {Client}=require('@modelcontextprotocol/sdk/client/index.js'),{StdioClientTransport}=require('@modelcontextprotocol/sdk/client/stdio.js');
  const client=new Client({name:'packed-install-check',version:'1'});
  try{
   await client.connect(new StdioClientTransport({command:process.execPath,args:[path.join(root,'dist/cli.js'),'mcp'],cwd:temp,env,stderr:'pipe'}));
   const tools=await client.listTools();assert(tools.tools.some(t=>t.name==='geogebra_build_artifact'));
   const response=await client.callTool({name:'geogebra_create_html',arguments:{commands:['c=Circle((0,0),5)']}});
   assert(!response.isError);assert(response.structuredContent.html.includes('id="gikz-browser"'));
   console.log(JSON.stringify({cleanInstall:true,lifecycleScripts:false,externalGikz:false,tools:tools.tools.length,version:report.version}));
  }finally{await client.close()}
  const unpacked=path.join(temp,'unpacked');await fs.mkdir(unpacked);
  execFileSync('tar',['-xzf',path.resolve('release',report.npm),'-C',unpacked]);
  const plugin=path.join(unpacked,'package');
  await assert.rejects(fs.access(path.join(plugin,'node_modules')));
  const launcherEnv={...env,GEOGEBRA_PLUGIN_RUNTIME:'1',npm_config_ignore_scripts:'true'};delete launcherEnv.VSCODE_WORKSPACE_FOLDER;
  const launcher=new Client({name:'unpacked-plugin-launcher-check',version:'1'});
  const launchTransport=new StdioClientTransport({command:process.platform==='win32'?'npx.cmd':'npx',args:['--yes','--prefix','./runtime','file:'+path.resolve('release',report.npm),'mcp'],cwd:plugin,env:launcherEnv,stderr:'pipe'});
  let launchErrors='';launchTransport.stderr?.on('data',chunk=>{launchErrors=(launchErrors+chunk.toString()).slice(-4000)});
  try{
   try{await launcher.connect(launchTransport)}catch(error){throw Error(error.message+'\nLauncher stderr:\n'+launchErrors)}
   const info=await launcher.callTool({name:'server_info',arguments:{}});
   assert.equal(info.structuredContent.version,report.version);
   const saved=await launcher.callTool({name:'geogebra_create_html',arguments:{commands:['A=(0,0)'],workspace:temp,filename:'unpacked-launcher.html'}});
   assert(!saved.isError,JSON.stringify(saved.content));
   assert.equal(saved.structuredContent.filename,path.join(await fs.realpath(temp),'unpacked-launcher.html'));
   const missing=await launcher.callTool({name:'geogebra_create_html',arguments:{commands:['A=(0,0)'],filename:'must-not-write-in-plugin.html'}});
   assert.equal(missing.isError,true);
   console.log(JSON.stringify({unpackedPluginLauncher:true,pluginNodeModules:false,workspaceOutput:true,version:report.version}));
  }finally{await launcher.close()}
 }finally{if(process.env.KEEP_STUDIO_INSTALL==='1')console.log('Retained clean install: '+temp);else await fs.rm(temp,{recursive:true,force:true})}
})().catch(e=>{console.error(e);process.exitCode=1});
