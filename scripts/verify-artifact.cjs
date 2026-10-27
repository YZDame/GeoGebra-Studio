// Browser-verified artifact via local CLI: no MCP transport or client.
const assert=require('node:assert/strict'),fs=require('node:fs/promises');
const {execFileSync}=require('node:child_process');
(async()=>{
 const dir='output/verification/studio';await fs.mkdir(dir,{recursive:true});
 const input={...require('../examples/tangent-construction.json'),filename:dir+'/tangent-construction.html'};
 await fs.rm(input.filename,{force:true});await fs.rm(input.filename.replace('.html','.preview.png'),{force:true});
 const spec=dir+'/tangent-construction.json';await fs.writeFile(spec,JSON.stringify(input));
 const data=JSON.parse(execFileSync(process.execPath,['dist/cli.js','generate','--input',spec,'--workspace',process.cwd(),'--verify'],{encoding:'utf8',timeout:180000}));
 assert(data.engineVerified&&data.packedGgbVerified&&data.renderVerified);
 const html=await fs.readFile(data.filename,'utf8');
 const payload=JSON.parse(html.match(/<script id="construction-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
 assert.deepEqual(payload.commands,[]);
 assert.equal(Buffer.from(payload.ggbBase64,'base64').subarray(0,2).toString(),'PK');
 console.log(JSON.stringify({filename:data.filename,renderVerified:true,mcp:false}));
})().catch(e=>{console.error(e);process.exitCode=1});
