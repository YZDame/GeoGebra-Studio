import path from 'path';
import os from 'os';
import { mkdir, writeFile, readFile, cp, rm, rename, access } from 'fs/promises';
import { spawn } from 'child_process';
export async function run(command:string,args:string[],cwd?:string):Promise<void>{
  await new Promise<void>((resolve,reject)=>{
    const child=spawn(command,args,{stdio:'inherit',shell:false,...(cwd?{cwd}: {})});
    child.once('error',reject);child.once('close',code=>code===0?resolve():reject(new Error(`${command} exited with ${code}`)));
  });
}
/** A persistent catalog uses an npm source, never the temporary npx package directory. */
export async function installPlugin(local=false):Promise<void>{
  const metadata=JSON.parse(await readFile(path.join(__dirname,'../../package.json'),'utf8'));
  const home=process.env['CODEX_HOME']||path.join(os.homedir(),'.codex');
  const root=path.join(home,'geogebra-studio','marketplace');
  await mkdir(path.join(root,'.agents','plugins'),{recursive:true});
  let source:Record<string,string>={source:'npm',package:metadata.name,version:metadata.version};
  if(local){
    // The default generator uses bundled files and Node built-ins, with no runtime install.
    const target=path.join(root,'plugin');
    const packageRoot=path.join(__dirname,'../..');
    const entries=['dist','gikz','skills','docs','examples','assets','plugin.json','.codex-plugin','package.json','LICENSE','LICENSE-MIT','THIRD_PARTY_NOTICES.md'];
    const missing:string[]=[];
    for(const entry of entries)await access(path.join(packageRoot,entry)).catch(()=>missing.push(entry));
    if(missing.length)throw new Error(`install --local needs a built checkout or the npm package; ${packageRoot} is missing ${missing.join(', ')}. From a copied Skill, run install without --local (npm source) instead. The existing plugin was not modified.`);
    // Stage the full replacement first so a failed copy never removes a working plugin.
    const staging=`${target}.staging-${process.pid}`;
    await rm(staging,{recursive:true,force:true});
    try{
      await mkdir(staging,{recursive:true});
      for(const entry of entries)await cp(path.join(packageRoot,entry),path.join(staging,entry),{recursive:true});
      const localPackagePath=path.join(staging,'package.json');
      const localPackage=JSON.parse(await readFile(localPackagePath,'utf8'));
      delete localPackage.devDependencies;
      await writeFile(localPackagePath,JSON.stringify(localPackage,null,2)+'\n');
      await rm(target,{recursive:true,force:true});
      await rename(staging,target);
    }catch(error){await rm(staging,{recursive:true,force:true});throw error;}
    source={source:'local',path:'./plugin'};
  }
  await writeFile(path.join(root,'.agents/plugins/marketplace.json'),JSON.stringify({name:'geogebra-studio',interface:{displayName:'GeoGebra Studio'},plugins:[{name:'geogebra-studio',source,policy:{installation:'AVAILABLE',authentication:'ON_INSTALL'},category:'Education'}]},null,2)+'\n');
  await run('codex',['plugin','marketplace','add',root]);
  await run('codex',['plugin','add','geogebra-studio@geogebra-studio']);
  console.log(`GeoGebra Studio ${metadata.version} installed. No MCP server or Chrome setup is required.\nStart a new Codex session and invoke @geogebra-studio. Existing geogebra-geometry installations were not removed.`);
}
