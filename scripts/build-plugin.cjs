const fs=require('node:fs/promises');
const {build}=require('esbuild');
const p=require('../package.json');
(async()=>{
 await build({entryPoints:['gikz/browser.cjs'],outfile:'dist/gikz-browser.js',bundle:true,format:'iife',platform:'browser',target:'es2022',minify:false,legalComments:'inline'});
 const plugin={"$schema":"https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",name:'geogebra-studio',version:p.version,description:p.description,author:{name:p.author},repository:p.repository.url.replace(/\.git$/,''),license:p.license,keywords:p.keywords,extensions:{'com.openai':{onboardingSkill:'./skills/geogebra-setup/SKILL.md',interface:{displayName:'GeoGebra Studio',shortDescription:'Editable geometry, interactive HTML and cleaned TikZ',developerName:p.author,category:'Education',defaultPrompt:['Construct an editable GeoGebra diagram from this problem and deliver a local HTML.']}}}};
 const server={command:'npx',args:['--yes','--prefix','./runtime',p.name+'@'+p.version,'mcp'],env:{GEOGEBRA_TOOL_PROFILE:'core',GEOGEBRA_PLUGIN_RUNTIME:'1'}};
 const mcp={"$schema":"https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",mcpServers:{geogebra:{type:'stdio',...server}}};
 const write=(file,value)=>fs.writeFile(file,JSON.stringify(value,null,2)+'\n');
 await fs.mkdir('.codex-plugin',{recursive:true});await fs.mkdir('.agents/plugins',{recursive:true});
 await write('plugin.json',plugin);await write('mcp.json',mcp);
 await write('.codex-plugin/plugin.json',{name:plugin.name,version:p.version,description:p.description,skills:'./skills/',mcpServers:'./.mcp.json',extensions:plugin.extensions});
 await write('.mcp.json',{mcpServers:{geogebra:server}});
 await write('.agents/plugins/marketplace.json',{name:'geogebra-studio',interface:{displayName:'GeoGebra Studio'},plugins:[{name:'geogebra-studio',source:{source:'npm',package:p.name,version:p.version},policy:{installation:'AVAILABLE',authentication:'ON_INSTALL'},category:'Education'}]});
})().catch(error=>{console.error(error);process.exitCode=1});
