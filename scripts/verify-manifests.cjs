const assert=require('node:assert/strict'),fs=require('node:fs');
const p=require('../package.json'),plugin=require('../plugin.json'),compat=require('../.codex-plugin/plugin.json'),market=require('../.agents/plugins/marketplace.json');
assert.equal(p.name,'@lydt/geogebra-studio');
assert.equal(plugin.name,'geogebra-studio');assert.equal(plugin.version,p.version);assert.equal(compat.version,p.version);
assert.equal(plugin.license,'GPL-2.0-or-later');assert.equal(plugin.extensions['com.openai'].onboardingSkill,'./skills/geogebra-studio/SKILL.md');
assert.equal(compat.skills,'./skills/');
assert.equal(market.plugins.find(x=>x.name==='geogebra-studio').source.version,p.version);
assert(!fs.existsSync('mcp.json'));assert(!fs.existsSync('.mcp.json'));assert(!fs.existsSync('mcp.optional.json'));
assert(!Object.keys(p.dependencies).some(x=>x.startsWith('@modelcontextprotocol/')));
for(const f of ['skills/geogebra-studio/SKILL.md','skills/geogebra-studio/scripts/geogebra-studio.cjs','skills/geogebra-studio/runtime/dist/cli.js','skills/geogebra-studio/runtime/dist/viewer.js','skills/geogebra-studio/runtime/dist/export/semantic.js','skills/geogebra-studio/runtime/gikz/core.cjs'])assert(fs.existsSync(f),f);
for(const name of ['geogebra-construct','geogebra-setup','geometry-export'])assert(!fs.existsSync('skills/'+name));
for(const key of ['composerIcon','logo']){const file=plugin.extensions['com.openai'].interface[key];if(file)assert(fs.existsSync(file));}
console.log(JSON.stringify({name:plugin.name,version:p.version,skills:1,mcp:false,portableRuntime:true}));
