const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {Client}=require('@modelcontextprotocol/sdk/client/index.js');
const {StdioClientTransport}=require('@modelcontextprotocol/sdk/client/stdio.js');
(async()=>{
 const client=new Client({name:'studio-artifact-check',version:'1'});
 const transport=new StdioClientTransport({command:process.execPath,args:['dist/cli.js','mcp'],stderr:'pipe'});
 const dir='output/verification/studio';await fs.mkdir(dir,{recursive:true});
 const input={...require('../examples/tangent-construction.json'),filename:dir+'/tangent-construction.html'};
 await fs.rm(input.filename,{force:true});await fs.rm(input.filename.replace('.html','.preview.png'),{force:true});
 try{
  await client.connect(transport);
  const result=await client.callTool({name:'geogebra_build_artifact',arguments:input},undefined,{timeout:180000});
  assert(!result.isError,JSON.stringify(result.content));
  const data=result.structuredContent;assert(data.engineVerified&&data.packedGgbVerified&&data.renderVerified);assert.equal(data.layoutChecks.loaded,true);assert.equal(data.layoutChecks.equalAxes,true);
  const preview=await fs.readFile(data.previewFilename);assert(preview.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
  const html=await fs.readFile(data.filename,'utf8');
  const spec=JSON.parse(html.match(/<script id="construction-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
  assert.deepEqual(spec.commands,[]);assert.equal(Buffer.from(spec.ggbBase64,'base64').subarray(0,2).toString(),'PK');
  assert(!html.includes('new Function('));assert(html.includes('id="gikz-browser"'));assert(html.includes('GNU GENERAL PUBLIC LICENSE'));
  await fs.writeFile(path.join(dir,'tangent-construction.ggb'),Buffer.from(spec.ggbBase64,'base64'));
  const failure=await client.callTool({name:'geogebra_build_artifact',arguments:{commands:['ThisCommandDoesNotExist(1)'],filename:dir+'/must-not-exist.html'}},undefined,{timeout:180000});
  assert.equal(failure.isError,true);await assert.rejects(fs.access(dir+'/must-not-exist.html'));
  console.log(JSON.stringify({filename:data.filename,previewFilename:data.previewFilename,objectCount:data.objectCount,engineVerified:true,packedGgbVerified:true,invalidCommandRejected:true}));
 }finally{await client.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
