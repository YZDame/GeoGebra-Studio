// Hermetic acceptance: the default workflow works in an unpacked plugin with no dependencies.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const {execFileSync, spawnSync} = require('node:child_process');
(async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'studio-generator-'));
  try {
    const plugin = path.join(temp, 'plugin'), workspace = path.join(temp, 'workspace');
    await fs.mkdir(plugin); await fs.mkdir(workspace);
    for (const entry of ['dist', 'gikz', 'package.json']) await fs.cp(path.resolve(entry), path.join(plugin,entry), {recursive:true});
    const guard = path.join(temp, 'guard.cjs');
    await fs.writeFile(guard, `const Module=require('node:module');const load=Module._load;Module._load=function(id,...args){if(/puppeteer|@modelcontextprotocol|studio[\\\\/]browser|studio[\\\\/]artifact/.test(id))throw Error('Unexpected runtime import: '+id);return load.call(this,id,...args)};`);
    const cli = path.join(plugin, 'dist/cli.js');
    const env = {...process.env, NODE_OPTIONS:'', PUPPETEER_EXECUTABLE_PATH:'/missing/chrome'};
    const run = args => execFileSync(process.execPath,['--require',guard,cli,...args],{cwd:workspace,env,encoding:'utf8'});
    assert.equal(JSON.parse(run(['doctor'])).chromeRequired,false);
    const spec = path.join(workspace,'diagram.json');
    await fs.writeFile(spec, JSON.stringify({commands:['A=(0,0)','B=(4,0)','c=Circle(A,B)'],filename:'nested/diagram.html',captionOverrides:{A:'</script><script>bad()</script>'}}));
    const args = ['generate','--input',spec,'--workspace',workspace];
    const result = JSON.parse(run(args));
    assert.equal(result.engineVerified,false); assert.equal(result.renderVerified,false); assert.equal(result.execution,'viewer');
    const html = await fs.readFile(result.filename,'utf8');
    assert(html.includes('deployggb.js'));assert(html.includes('gikz-browser'));assert(html.includes('geogebraStudio'));assert(html.includes('viewer-themes'));
    // Compact English chrome: icon download, short format labels, Default theme.
    assert(html.includes('class="control-button icon-button download-toggle"'));
    assert(html.includes('aria-label="Download"'));
    assert(html.includes('aria-label="Show objects"'));
    assert(html.includes('aria-label="Theme"'));
    assert(html.includes('id="theme-name">Default</span>'));
    assert.equal((html.match(/data-format="(?:ggb|png|svg|tikz|pdf|xml|html)"/g)||[]).length,7);
    assert(html.includes('>GGB</button>')&&html.includes('>PNG</button>')&&html.includes('>HTML</button>'));
    assert(html.includes('default: "Default"'));
    assert(html.includes('lang="en"'));
    assert(html.includes('language: "en"')||html.includes('language:"en"'));
    const payload=JSON.parse(html.match(/<script id="construction-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(payload.captionOverrides.A,'</script><script>bad()</script>');
    for (const script of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
      if (!script[0].includes('application/json')) new vm.Script(script[1]);
    }
    const original = html;
    assert.notEqual(spawnSync(process.execPath,[cli,...args],{cwd:workspace,env}).status,0);
    assert.equal(await fs.readFile(result.filename,'utf8'),original);
    await fs.symlink(plugin,path.join(workspace,'escape'),'dir');
    for (const filename of ['../escaped.html','escape/escaped.html']) {
      assert.notEqual(spawnSync(process.execPath,[cli,...args,'--output',filename],{cwd:workspace,env}).status,0);
    }
    await assert.rejects(fs.access(path.join(plugin,'escaped.html')));
    await fs.writeFile(spec,JSON.stringify({commands:[],filename:'empty.html'}));
    assert.notEqual(spawnSync(process.execPath,[cli,...args],{cwd:workspace,env}).status,0);
    await assert.rejects(fs.access(path.join(workspace,'empty.html')));
    assert(run([]).includes('generate --input'));
    console.log(JSON.stringify({dependencyFreeGenerator:true,chromeRequired:false,mcpRequired:false,inlineScriptsValid:true,pathSafety:true,noOverwrite:true}));
  } finally { await fs.rm(temp,{recursive:true,force:true}); }
})().catch(error => {console.error(error);process.exitCode=1;});
