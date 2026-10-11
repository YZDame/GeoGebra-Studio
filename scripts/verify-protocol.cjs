const assert = require('node:assert/strict');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
(async () => {
  const client = new Client({name:'geogebra-verification',version:'1.0.0'});
  const transport = new StdioClientTransport({command:process.execPath,args:['dist/cli.js'],stderr:'pipe'});
  try {
    await client.connect(transport);
    const tools = await client.listTools();
    assert(tools.tools.some(t => t.name === 'geogebra_export_ggb'));
    const echo = await client.callTool({name:'echo',arguments:{message:'verified'}});
    assert.equal(echo.content[0].text,'Echo: verified');
    await assert.rejects(client.callTool({name:'echo',arguments:{message:12}}));
    await assert.rejects(client.callTool({name:'does_not_exist',arguments:{}}));
    const resources = await client.listResources();
    assert(resources.resources.some(r => r.uri === 'geogebra://guide'));
    assert((await client.readResource({uri:'geogebra://guide'})).contents[0].text.includes('share one construction'));
    assert((await client.getPrompt({name:'construct-geometry',arguments:{problem:'Triangle ABC'}})).messages.length);
    console.log(JSON.stringify({status:'passed',tools:tools.tools.length,server:client.getServerVersion()}));
  } finally { await client.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
