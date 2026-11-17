const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const p=require('../package.json'),plugin=require('../plugin.json'),compat=require('../.codex-plugin/plugin.json'),cursor=require('../.cursor-plugin/plugin.json'),market=require('../.agents/plugins/marketplace.json');
assert.equal(p.name,'@lydt/geogebra-studio');
assert.equal(plugin.name,'geogebra-studio');assert.equal(plugin.version,p.version);assert.equal(compat.version,p.version);
assert.equal(cursor.name,plugin.name);assert.equal(cursor.version,p.version);assert.equal(cursor.description,plugin.description);
assert.deepEqual(cursor.author,plugin.author);assert.equal(cursor.license,plugin.license);assert.equal(cursor.repository,plugin.repository);assert.deepEqual(cursor.keywords,plugin.keywords);
assert.equal(cursor.logo,'assets/geogebra-icon.png');assert(!path.isAbsolute(cursor.logo));assert(!cursor.logo.split(/[\\/]/).includes('..'));assert(fs.existsSync(cursor.logo));
assert(!fs.existsSync('.cursor-plugin/marketplace.json'));
assert.equal(plugin.license,'GPL-2.0-or-later');assert.equal(plugin.extensions['com.openai'].onboardingSkill,'./skills/geogebra-studio/SKILL.md');
assert.equal(compat.skills,'./skills/');
assert.equal(market.plugins.find(x=>x.name==='geogebra-studio').source.version,p.version);
assert(!fs.existsSync('mcp.json'));assert(!fs.existsSync('.mcp.json'));assert(!fs.existsSync('mcp.optional.json'));
assert(!Object.keys(p.dependencies).some(x=>x.startsWith('@modelcontextprotocol/')));
for(const f of ['skills/geogebra-studio/SKILL.md','skills/geogebra-studio/scripts/geogebra-studio.cjs','skills/geogebra-studio/runtime/dist/cli.js','skills/geogebra-studio/runtime/dist/viewer.js','skills/geogebra-studio/runtime/dist/export/semantic.js','skills/geogebra-studio/runtime/gikz/core.cjs'])assert(fs.existsSync(f),f);
for(const name of ['napoleon','nine-point-circle','hyperboloid-ruled','cycloid']){
 const repo=path.join('examples',name+'.json');
 const skill=path.join('skills/geogebra-studio/examples',name+'.json');
 assert(fs.existsSync(repo),repo);assert(fs.existsSync(skill),skill);
 assert.equal(fs.readFileSync(skill,'utf8'),fs.readFileSync(repo,'utf8'),name+' showcase template must match inside the Skill');
}
for(const name of ['geogebra-construct','geogebra-setup','geometry-export'])assert(!fs.existsSync('skills/'+name));
for(const key of ['composerIcon','logo']){const file=plugin.extensions['com.openai'].interface[key];if(file)assert(fs.existsSync(file));}
for(const file of ['skills/geogebra-studio/SKILL.md','plugins/dsh-geogebra-studio/skills/geogebra-studio/SKILL.md']){
 const fm=fs.readFileSync(file,'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
 assert(fm,file+' frontmatter');
 const name=fm[1].match(/^name:\s*(\S+)\s*$/m),description=fm[1].match(/^description:\s*(.+)\s*$/m);
 assert(name&&description,file+' name and description');
 assert.equal(name[1],path.basename(path.dirname(file)),file);
 assert(description[1].includes('Use when'),file+' description must say when to use the skill');
}
console.log(JSON.stringify({name:plugin.name,version:p.version,skills:1,mcp:false,portableRuntime:true}));
