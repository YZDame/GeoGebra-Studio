const assert=require('node:assert/strict'),fs=require('node:fs');
const p=require('../package.json'),plugin=require('../plugin.json'),mcp=require('../mcp.json'),compat=require('../.codex-plugin/plugin.json'),legacy=require('../.mcp.json'),market=require('../.agents/plugins/marketplace.json');
assert.equal(p.name,'@lydt/geogebra-studio');assert(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z]+(?:[.-][0-9A-Za-z]+)*)?$/.test(p.version));assert.equal(plugin.name,'geogebra-studio');assert.equal(plugin.version,p.version);
assert.equal(plugin.license,'GPL-2.0-or-later');assert.equal(plugin.extensions['com.openai'].onboardingSkill,'./skills/geogebra-setup/SKILL.md');
assert.equal(mcp.$schema,'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json');
assert.deepEqual(mcp.mcpServers,{});assert.deepEqual(legacy.mcpServers,{});
const server=require('../mcp.optional.json').mcpServers.geogebra;assert.equal(server.type,'stdio');assert.equal(server.command,'npx');assert.deepEqual(server.args,['--yes','--prefix','./runtime',`${p.name}@${p.version}`,'mcp']);assert(fs.existsSync('runtime/package.json'));
assert.equal(compat.version,p.version);assert.equal(compat.skills,'./skills/');assert.equal(compat.mcpServers,undefined);
const item=market.plugins.find(x=>x.name==='geogebra-studio');assert.equal(item.source.package,p.name);assert.equal(item.source.version,p.version);
for(const filename of ['skills/geogebra-construct/SKILL.md','skills/geogebra-setup/SKILL.md','skills/geometry-export/SKILL.md'])assert(fs.existsSync(filename),filename);
for(const key of ['composerIcon','logo']){const file=plugin.extensions['com.openai'].interface[key];if(file)assert(fs.existsSync(file));}
console.log(JSON.stringify({plugin:plugin.name,version:p.version,defaultMcpServers:0,optionalMcpServer:'geogebra',skills:3,marketplace:'npm exact version'}));
