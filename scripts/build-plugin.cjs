const fs=require('node:fs/promises');
const path=require('node:path');
const {build}=require('esbuild');
const p=require('../package.json');
(async()=>{
 await build({entryPoints:['gikz/browser.cjs'],outfile:'dist/gikz-browser.js',bundle:true,format:'iife',platform:'browser',target:'es2022',legalComments:'inline'});
 await build({entryPoints:['viewer/main.js'],outfile:'dist/viewer.js',bundle:true,format:'iife',platform:'browser',target:'es2022'});
 // Bundle the XML parser so a copied Skill never requires npm install.
 await build({entryPoints:['src/export/semantic.ts'],outfile:'dist/export/semantic.js',bundle:true,platform:'node',format:'cjs',target:'node22'});
 const icons=await fs.access('assets/geogebra-icon.png').then(()=>({composerIcon:'./assets/geogebra-icon.png',logo:'./assets/geogebra-icon.png'}),()=>({}));
 const plugin={"$schema":"https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",name:'geogebra-studio',version:p.version,description:p.description,author:{name:p.author},repository:p.repository.url.replace(/\\.git$/,''),license:p.license,keywords:p.keywords,extensions:{'com.openai':{onboardingSkill:'./skills/geogebra-studio/SKILL.md',interface:{displayName:'GeoGebra Studio',shortDescription:'Portable editable geometry skill',developerName:p.author,category:'Education',...icons,defaultPrompt:['Create an editable GeoGebra HTML construction and open it in my browser.']}}}};
 const write=(file,value)=>fs.writeFile(file,JSON.stringify(value,null,2)+'\\n');
 await fs.mkdir('.codex-plugin',{recursive:true});await fs.mkdir('.agents/plugins',{recursive:true});
 await write('plugin.json',plugin);
 await write('.codex-plugin/plugin.json',{name:plugin.name,version:p.version,description:p.description,skills:'./skills/',extensions:plugin.extensions});
 await write('.agents/plugins/marketplace.json',{name:'geogebra-studio',interface:{displayName:'GeoGebra Studio'},plugins:[{name:'geogebra-studio',source:{source:'npm',package:p.name,version:p.version},policy:{installation:'AVAILABLE',authentication:'ON_INSTALL'},category:'Education'}]});
 const dest=path.join('skills','geogebra-studio','runtime');
 await fs.rm(dest,{recursive:true,force:true});await fs.mkdir(dest,{recursive:true});
 await fs.cp('dist',path.join(dest,'dist'),{recursive:true});
 await fs.cp('gikz',path.join(dest,'gikz'),{recursive:true});
 const slim={name:p.name,version:p.version,private:true,license:p.license};
 await write(path.join(dest,'package.json'),slim);
})().catch(e=>{console.error(e);process.exitCode=1;});
