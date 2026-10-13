import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { McpServer } from '../src/server';
import { constructionHtml } from '../src/export/html';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { pathToFileURL } from 'url';
import { ListRootsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

jest.mock('puppeteer-core', () => ({ __esModule: true, default: { launch: jest.fn() } }));

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
    const captionOverrides={g:'Γ',w:'ω'};
    const result = await client.callTool({name:'geogebra_create_html',arguments:{commands:['g: x^2+y^2=25','w: (x-3)^2+y^2=64/25'],visibleLabels:['g','w'],captionOverrides}});
    expect(result.isError).not.toBe(true);
    expect(result.structuredContent).toMatchObject({ success:true, requiresNetwork:true,renderVerified:false });
    const html=(result.structuredContent as {html:string}).html;
    const payload=html.match(/<script id="construction-data" type="application\/json">([\s\S]*?)<\/script>/)?.[1];
    expect(JSON.parse(payload!).captionOverrides).toEqual(captionOverrides);
    const descriptor=(await client.listTools()).tools.find(t=>t.name==='geogebra_create_html');
    expect(descriptor?._meta).toMatchObject({ui:{resourceUri:'ui://geogebra/preview.html'}});
    expect(descriptor?.inputSchema.properties).toHaveProperty('captionOverrides');
  });
  it('saves plugin artifacts only in an explicit user workspace and keeps the context per request', async () => {
    const root=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'studio-workspace-')));
    const previous=process.env['GEOGEBRA_PLUGIN_RUNTIME'],previousRoot=process.env['VSCODE_WORKSPACE_FOLDER'];
    process.env['GEOGEBRA_PLUGIN_RUNTIME']='1';delete process.env['VSCODE_WORKSPACE_FOLDER'];
    try{
      const result=await client.callTool({name:'geogebra_create_html',arguments:{commands:['A=(0,0)'],workspace:root,filename:'figure.html'}});
      expect(result.isError).not.toBe(true);expect(result.structuredContent).toMatchObject({filename:path.join(root,'figure.html')});
      expect(await fs.readFile(path.join(root,'figure.html'),'utf8')).toContain('construction-data');
      const missing=await client.callTool({name:'geogebra_create_html',arguments:{commands:['A=(0,0)'],filename:'missing-workspace.html'}});
      expect(missing.isError).toBe(true);expect(JSON.stringify(missing)).toContain('Provide workspace');
      const escape=await client.callTool({name:'geogebra_create_html',arguments:{commands:['A=(0,0)'],workspace:root,filename:'../escape.html'}});
      expect(escape.isError).toBe(true);expect(JSON.stringify(escape)).toContain('outside workspace');
    }finally{
      if(previous===undefined)delete process.env['GEOGEBRA_PLUGIN_RUNTIME'];else process.env['GEOGEBRA_PLUGIN_RUNTIME']=previous;
      if(previousRoot===undefined)delete process.env['VSCODE_WORKSPACE_FOLDER'];else process.env['VSCODE_WORKSPACE_FOLDER']=previousRoot;
      await fs.rm(root,{recursive:true,force:true});
    }
  });
  it('uses a client-provided MCP root for a saved artifact',async()=>{
    const root=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'studio-mcp-root-')));
    await client.close();await server.close();
    client=new Client({name:'root-client',version:'1'},{capabilities:{roots:{listChanged:true}}});
    client.setRequestHandler(ListRootsRequestSchema,async()=>({roots:[{uri:pathToFileURL(root).href}]}));
    server=new McpServer({name:'GeoGebra',version:'0.4.0',description:'Test'}).createProtocolServer();
    const [clientTransport,serverTransport]=InMemoryTransport.createLinkedPair();
    try{
      await Promise.all([server.connect(serverTransport),client.connect(clientTransport)]);
      const result=await client.callTool({name:'geogebra_create_html',arguments:{commands:['A=(0,0)'],filename:'roots.html'}});
      expect(result.isError).not.toBe(true);expect(result.structuredContent).toMatchObject({filename:path.join(root,'roots.html')});
    }finally{await fs.rm(root,{recursive:true,force:true});}
  });
  it('ships responsive sizing, native math labels, and paired reader themes', () => {
    const html=constructionHtml({commands:['A=(0,0)']});
    expect(html.indexOf('id="theme-toggle"')).toBeLessThan(html.indexOf('id="download-toggle"'));
    expect(html).toContain('disableAutoScale:true');
    expect(html).toContain('ResizeObserver');
    expect(html).toContain('id="mode-toggle"');
    expect(html).toContain('id="sidebar-toggle"');
    expect(html).toContain('api.exportPGF(done)');
    expect(html).toContain('showToolBar:true,showMenuBar:true,showAlgebraInput:true');
    expect(html).toContain('api.showToolBar(false)');
    expect(html).toContain('themeObjectColors.has(api.getColor(object).toLowerCase())');
    expect(html).not.toContain('<select');
    expect(html).toContain('true, true)');
    expect(html).toContain('setGraphicsOptions(1,{bgColor:palette.paper})');
    expect(html).toContain('catppuccin');
    expect(html).not.toContain('#ggb-element>div');
    expect(html).toContain("format==='pdf'||format==='ggb'");
  });
  it('emits syntactically valid bootstrap JavaScript in the generated HTML', () => {
    const html=constructionHtml({commands:['A=(0,0)']});
    const scripts=[...html.matchAll(/<script>\s*([\s\S]*?)<\/script>/g)].map(match=>match[1]);
    expect(scripts.length).toBeGreaterThanOrEqual(1);
    for(const script of scripts) expect(() => new Function(script!)).not.toThrow();
  });
});
