// Build first. Packaging never depends on lifecycle hooks at consumer install time.
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {execFileSync}=require('node:child_process');
(async()=>{
 const p=require('../package.json'),root=path.resolve(__dirname,'..'),out=path.join(root,'release');
 const requestedVersion=process.argv[2];
 if(requestedVersion&&!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z]+(?:[.-][0-9A-Za-z]+)*)?$/.test(requestedVersion))throw Error('Invalid release version');
 const version=requestedVersion||p.version;
 await fs.access(path.join(root,'dist/cli.js'));
 for(const file of ['plugin.json','.codex-plugin/plugin.json']){const manifest=JSON.parse(await fs.readFile(path.join(root,file),'utf8'));if(manifest.version!==p.version)throw Error(file+' version mismatch');}
 await fs.mkdir(out,{recursive:true});
 let packed=JSON.parse(execFileSync('npm',['pack','--ignore-scripts','--json','--pack-destination',out],{cwd:root,encoding:'utf8',env:{...process.env,npm_config_cache:path.join(os.tmpdir(),'geogebra-studio-release-npm-cache')}}))[0];
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),'geogebra-release-'));
 try{
  execFileSync('tar',['-xzf',path.join(out,packed.filename),'-C',temp]);
  const staging=path.join(temp,'geogebra-studio');await fs.rename(path.join(temp,'package'),staging);
  if(version!==p.version){
   const replace=value=>typeof value==='string'?(value===p.version?version:value.replace(p.name+'@'+p.version,p.name+'@'+version)):Array.isArray(value)?value.map(replace):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([key,item])=>[key,replace(item)])):value;
   for(const file of ['package.json','plugin.json','mcp.json','mcp.optional.json','.mcp.json','.codex-plugin/plugin.json','.agents/plugins/marketplace.json']){
    const data=JSON.parse(await fs.readFile(path.join(staging,file),'utf8'));
    await fs.writeFile(path.join(staging,file),JSON.stringify(replace(data),null,2)+'\n');
   }
   packed=JSON.parse(execFileSync('npm',['pack','--ignore-scripts','--json','--pack-destination',out],{cwd:staging,encoding:'utf8',env:{...process.env,npm_config_cache:path.join(os.tmpdir(),'geogebra-studio-release-npm-cache')}}))[0];
  }
  for(const file of ['dist/cli.js','dist/gikz-browser.js','dist/viewer.js','dist/studio/generate.js','runtime/package.json','gikz/core.cjs','gikz/cli.cjs','gikz/LICENSE','LICENSE','LICENSE-MIT','skills/geogebra-construct/SKILL.md','mcp.json','mcp.optional.json'])await fs.access(path.join(staging,file));
  const configs=await Promise.all(['plugin.json','mcp.json','.mcp.json','.codex-plugin/plugin.json'].map(f=>fs.readFile(path.join(staging,f),'utf8')));
  if(configs.some(s=>/\/Users\/|_npx\/|GIKZ_CLI/.test(s)))throw Error('Nonportable release manifest');
  const zip=path.join(out,`geogebra-studio-${version}.zip`);await fs.rm(zip,{force:true});
  execFileSync('zip',['-q','-r',zip,'geogebra-studio'],{cwd:temp});
  await fs.writeFile(path.join(out,'package-report.json'),JSON.stringify({version,npm:packed.filename,zip:path.basename(zip),files:packed.files.map(f=>f.path),sha512:packed.integrity},null,2)+'\n');
  console.log(JSON.stringify({npm:path.join(out,packed.filename),zip}));
 }finally{await fs.rm(temp,{recursive:true,force:true})}
})().catch(e=>{console.error(e);process.exitCode=1});
