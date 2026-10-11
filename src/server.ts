import { EventEmitter } from 'events';
import { createServer, Server as HttpServer } from 'http';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema,
  ReadResourceRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema,
  ErrorCode, McpError,
} from '@modelcontextprotocol/sdk/types.js';
import Ajv from 'ajv';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { toolRegistry } from './tools';
import { McpServerConfig } from './types/mcp';
import { instancePool } from './tools/geogebra-tools';

const guidance = 'Use geogebra_create_html for a browser-only construction without Chromium. ' +
  'For server-side work use geogebra_eval_commands, then native exports. ' +
  'Use geogebra_get_semantic_scene before semantic export; report unsupported objects and coordinate fallbacks. ' +
  'All server-side tools share one construction. Do not interleave independent diagrams.';

/** Official SDK owns framing, negotiation, notifications, and transport lifecycle. */
export class McpServer extends EventEmitter {
  private sdk?: Server;
  private http?: HttpServer;
  private connections = new Set<Server>();
  private running = false;
  private queue: Promise<unknown> = Promise.resolve();
  constructor(private config: McpServerConfig) { super(); }

  private createSdk(): Server {
    const sdk = new Server({ name: this.config.name, version: this.config.version }, {
      capabilities: { tools: {}, resources: {}, prompts: {} }, instructions: guidance,
    });
    const ajv = new Ajv({ strict: false, allErrors: true });
    const validators = new Map(toolRegistry.getTools().map(t => [t.name, ajv.compile(t.inputSchema)]));
    sdk.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: toolRegistry.getTools() }));
    sdk.setRequestHandler(CallToolRequestSchema, async request => {
      const { name, arguments: args = {} } = request.params;
      const validate = validators.get(name);
      if (!validate) throw new McpError(ErrorCode.InvalidParams, `Unknown tool: ${name}`);
      if (!validate(args)) throw new McpError(ErrorCode.InvalidParams, ajv.errorsText(validate.errors));
      // Queue the entire operation, including export, to avoid cross-request mutation races.
      const operation = this.queue.then(async () => {
        try {
          const result = await toolRegistry.executeTool(name, args);
          if (!result.structuredContent && result.content.length === 1 && result.content[0]?.text) {
            try {
              const value: unknown = JSON.parse(result.content[0].text);
              if (value && typeof value === 'object' && !Array.isArray(value)) {
                return { ...result, structuredContent: value as Record<string, unknown> };
              }
            } catch { /* Existing plain text tools remain valid. */ }
          }
          return result;
        } catch (error) {
          return { content: [{ type: 'text' as const, text: error instanceof Error ? error.message : String(error) }], isError: true };
        }
      });
      this.queue = operation.catch(() => undefined);
      return operation;
    });
    sdk.setRequestHandler(ListResourcesRequestSchema, async () => ({ resources: [{
      uri: 'geogebra://guide', name: 'GeoGebra construction and export guide', mimeType: 'text/plain',
    }] }));
    sdk.setRequestHandler(ReadResourceRequestSchema, async request => {
      if (request.params.uri !== 'geogebra://guide') throw new McpError(ErrorCode.InvalidParams, 'Unknown resource');
      return { contents: [{ uri: 'geogebra://guide', mimeType: 'text/plain', text: guidance }] };
    });
    sdk.setRequestHandler(ListPromptsRequestSchema, async () => ({ prompts: [{
      name: 'construct-geometry', description: 'Build an editable, print-style GeoGebra construction',
      arguments: [{ name: 'problem', description: 'Geometry definitions and target exports', required: true }],
    }] }));
    sdk.setRequestHandler(GetPromptRequestSchema, async request => {
      if (request.params.name !== 'construct-geometry' || !request.params.arguments?.['problem']) {
        throw new McpError(ErrorCode.InvalidParams, 'construct-geometry requires problem');
      }
      return { messages: [{ role: 'user' as const, content: { type: 'text' as const,
        text: `${guidance}\n\n${request.params.arguments['problem']}` } }] };
    });
    return sdk;
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.sdk = this.createSdk();
    await this.sdk.connect(new StdioServerTransport());
    this.running = true;
    this.emit('started');
  }

  /** Loopback-only, single-user HTTP. Deploy behind HTTPS + authentication for remote use. */
  async startHttp(port: number): Promise<void> {
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid HTTP port');
    this.http = createServer(async (req, res) => {
      if (req.url !== '/mcp') { res.writeHead(404).end(); return; }
      if (req.headers.origin && ![`http://localhost:${port}`, `http://127.0.0.1:${port}`].includes(req.headers.origin)) {
        res.writeHead(403).end('Origin forbidden'); return;
      }
      const host = req.headers.host;
      if (!host || ![`localhost:${port}`, `127.0.0.1:${port}`].includes(host)) {
        res.writeHead(403).end('Host forbidden'); return;
      }
      const sdk = this.createSdk();
      const transport = new StreamableHTTPServerTransport({ enableJsonResponse: true });
      this.connections.add(sdk);
      res.on('close', () => { void sdk.close(); this.connections.delete(sdk); });
      try {
        await sdk.connect(transport as Transport);
        await transport.handleRequest(req, res);
      } catch { if (!res.headersSent) res.writeHead(500).end('MCP request failed'); }
    });
    await new Promise<void>((resolve, reject) => {
      this.http!.once('error', reject);
      this.http!.listen(port, '127.0.0.1', resolve);
    });
    this.running = true;
    this.emit('started');
  }

  async stop(): Promise<void> {
    await this.queue;
    await this.sdk?.close();
    await Promise.all([...this.connections].map(s => s.close()));
    if (this.http) await new Promise<void>((resolve, reject) => this.http!.close(e => e ? reject(e) : resolve()));
    await instancePool.cleanup();
    this.running = false;
    this.emit('stopped');
  }
  getStatus() { return { ...this.config, isRunning: this.running, toolCount: toolRegistry.getToolCount(), uptime: this.running ? process.uptime() : 0 }; }
  getConfig() { return { ...this.config }; }
  isServerRunning() { return this.running; }
}
