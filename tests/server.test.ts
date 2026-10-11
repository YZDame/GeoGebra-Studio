import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { McpServer } from '../src/server';

jest.mock('puppeteer', () => ({ __esModule: true, default: { launch: jest.fn() } }));

describe('Official MCP SDK contract', () => {
  let client: Client;
  let server: Server;
  beforeEach(async () => {
    server = new McpServer({ name: 'GeoGebra', version: '0.2.0', description: 'Test' }).createProtocolServer();
    client = new Client({ name: 'contract-test', version: '1.0.0' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(serverTransport),client.connect(clientTransport)]);
  });
  afterEach(async () => { await client.close(); await server.close(); });

  it('negotiates and exposes existing tools with annotations', async () => {
    expect(client.getServerVersion()?.name).toBe('GeoGebra');
    const tools = (await client.listTools()).tools;
    expect(tools.find(t=>t.name==='geogebra_export_ggb')).toBeDefined();
    expect(tools.find(t=>t.name==='geogebra_get_objects')?.annotations?.readOnlyHint).toBe(true);
  });
  it('validates arguments and unknown tools before execution', async () => {
    await expect(client.callTool({ name: 'echo', arguments: { message: 1 } })).rejects.toThrow();
    await expect(client.callTool({ name: 'missing', arguments: {} })).rejects.toThrow();
    const echo = await client.callTool({ name: 'echo', arguments: { message: 'hello' } });
    expect(echo.content).toEqual([{ type: 'text', text: 'Echo: hello' }]);
  });
  it('serves guidance and a construction prompt', async () => {
    expect((await client.readResource({uri:'geogebra://guide'})).contents).toHaveLength(1);
    expect((await client.getPrompt({name:'construct-geometry',arguments:{problem:'Triangle ABC'}})).messages).toHaveLength(1);
    await expect(client.readResource({uri:'geogebra://missing'})).rejects.toThrow();
  });
  it('generates HTML without launching a browser and advertises standard UI metadata', async () => {
    const result = await client.callTool({name:'geogebra_create_html',arguments:{commands:['A=(0,0)']}});
    expect(result.isError).not.toBe(true);
    expect(result.structuredContent).toMatchObject({ success:true, requiresNetwork:true,renderVerified:false });
    const descriptor=(await client.listTools()).tools.find(t=>t.name==='geogebra_create_html');
    expect(descriptor?._meta).toMatchObject({ui:{resourceUri:'ui://geogebra/preview.html'}});
  });
});
