const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const {Client}=require('@modelcontextprotocol/sdk/client/index.js');
const {StdioClientTransport}=require('@modelcontextprotocol/sdk/client/stdio.js');
(async()=>{
 const client=new Client({name:'mandatory-gikz-check',version:'1'});
 const transport=new StdioClientTransport({command:process.execPath,args:['dist/cli.js'],stderr:'pipe'});
 const call=async(name,args={})=>{const response=await client.callTool({name,arguments:args});assert(!response.isError,JSON.stringify(response.content));return response.structuredContent||JSON.parse(response.content[0].text)};
 try{
  await client.connect(transport);
  assert((await client.listTools()).tools.some(t=>t.name==='geogebra_export_tikz'));
  const fixture=JSON.parse(await fs.readFile('examples/tangent-construction.json','utf8'));
  const construction=await call('geogebra_eval_commands',{commands:fixture.commands});
  assert(construction.success&&construction.completedAll&&construction.successCount===fixture.commands.length,JSON.stringify(construction));
  for(const name of ['geogebra_export_tikz','geogebra_export_source','geogebra_api_call']){
   const result=await call(name,name==='geogebra_api_call'?{method:'exportPGF',waitForCallbackIndex:0}:name==='geogebra_export_source'?{format:'tikz'}:{});
   assert.equal(result.cleaned,true);assert.equal(result.backend,'native-pgf+gikz');
   const code=result.code||result.value;
   assert(code.includes('circle (5cm)'));assert(code.includes('circle (1.6cm)'));
   assert(!code.includes('definecolor'));assert(!code.includes('line width='));assert.equal((code.match(/plot\(/g)||[]).length,2);
   assert.equal((code.match(/\\coordinate /g)||[]).length,5);
   await fs.writeFile(`output/verification/${name}-cleaned.tex`,code);
   console.log(name+': native GeoGebra → Gikz verified');
  }
 }finally{await client.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
