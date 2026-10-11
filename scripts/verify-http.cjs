const assert=require('node:assert/strict');
const {Client}=require('@modelcontextprotocol/sdk/client/index.js');
const {StreamableHTTPClientTransport}=require('@modelcontextprotocol/sdk/client/streamableHttp.js');
const {McpServer}=require('../dist/server');
(async()=>{
  const port=20000+Math.floor(Math.random()*20000);
  const server=new McpServer({name:'HTTP verification',version:'0.2.0',description:'Test'});
  const client=new Client({name:'http-test',version:'1.0.0'});
  try{
    await server.startHttp(port);
    const url=new URL(`http://127.0.0.1:${port}/mcp`);
    const transport=new StreamableHTTPClientTransport(url);
    await client.connect(transport);
    assert.equal((await client.listTools()).tools.length,process.env.GEOGEBRA_TOOL_PROFILE==='core'?16:50);
    assert((await client.callTool({name:'server_info',arguments:{}})).structuredContent);
    assert.equal(transport.sessionId,undefined);
    const forbidden=await fetch(url,{method:'POST',headers:{origin:'https://untrusted.example','content-type':'application/json'},body:'{}'});
    assert.equal(forbidden.status,403);
    console.log('Streamable HTTP client, tool calls, stateless transport, and Origin rejection passed.');
  }finally{await client.close();await server.stop();}
})().catch(e=>{console.error(e);process.exitCode=1});
