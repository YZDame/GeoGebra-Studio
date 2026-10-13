import { ToolDefinition } from '../types/mcp';
import { cleanWithGikz } from '../export/gikz';
import { instancePool } from './geogebra-tools';

const result = (value: Record<string, unknown>) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(value) }], structuredContent: value,
});

/** A schema-checked bridge to the public methods exposed by the loaded GeoGebra Apps API. */
export const appsApiTools: ToolDefinition[] = [
  {
    tool: {
      name: 'geogebra_api_list_methods',
      description: 'List callable methods exposed by the active GeoGebra Apps API. Availability depends on the loaded GeoGebra app/version.',
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    },
    handler: async () => {
      try {
        const methods = await (await instancePool.getDefaultInstance()).listAppsApiMethods();
        return result({ success: true, methods, count: methods.length });
      } catch (error) {
        return { ...result({ success: false, error: error instanceof Error ? error.message : String(error) }), isError: true };
      }
    },
  },
  {
    tool: {
      name: 'geogebra_api_call',
      description: 'Call a public GeoGebra Apps API method by name with JSON arguments. Use geogebra_api_list_methods first. For one-shot callback exports set waitForCallbackIndex (0 for getBase64/exportSVG/getScreenshotBase64; 1 for exportPDF). For persistent listener functions put {"$ggbCallbackId":"my-id"} at that argument, then poll geogebra_api_get_callback_events; reuse the same marker to unregister. exportPGF always returns Gikz-cleaned standalone TikZ through this bridge. Destructive methods require allowDestructive=true.',
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false },
      inputSchema: {
        type: 'object',
        properties: {
          method: { type: 'string', minLength: 1, maxLength: 100 },
          args: { type: 'array', maxItems: 20, items: {} },
          waitForCallbackIndex: { type: 'integer', minimum: 0, maximum: 20 },
          callbackTimeoutMs: { type: 'integer', minimum: 100, maximum: 60000 },
          allowDestructive: { type: 'boolean', description: 'Required for methods that clear, replace, open, or remove a construction/applet.' },
        },
        required: ['method'], additionalProperties: false,
      },
    },
    handler: async params => {
      try {
        const method = params['method'] as string;
        if (method === 'exportPGF') {
          const source = await (await instancePool.getDefaultInstance()).exportNativeTikZ();
          const value = await cleanWithGikz(source, {standalone:true});
          return result({success:true,method,value,backend:'native-pgf+gikz',cleaned:true,semantics:'visual-snapshot'});
        }
        const dangerous = new Set(['newConstruction','reset','openFile','setXML','evalXML','setBase64','remove']);
        if (dangerous.has(method) && params['allowDestructive'] !== true) {
          throw new Error(`${method} can replace or clear construction data; set allowDestructive=true to proceed`);
        }
        const args = (params['args'] as unknown[] | undefined) ?? [];
        const callbacks: Array<{ argumentIndex: number; id: string }> = [];
        for (let i = 0; i < args.length; i++) {
          const arg = args[i];
          if (arg && typeof arg === 'object' && !Array.isArray(arg) && typeof (arg as Record<string, unknown>)['$ggbCallbackId'] === 'string') {
            callbacks.push({ argumentIndex: i, id: (arg as Record<string, unknown>)['$ggbCallbackId'] as string });
            args[i] = null;
          }
        }
        const value = await (await instancePool.getDefaultInstance()).callAppsApi(
          method,
          args,
          {
            ...(typeof params['waitForCallbackIndex'] === 'number' ? { waitForCallbackIndex: params['waitForCallbackIndex'] } : {}),
            ...(typeof params['callbackTimeoutMs'] === 'number' ? { callbackTimeoutMs: params['callbackTimeoutMs'] } : {}),
            ...(callbacks.length ? { callbacks } : {}),
          },
        );
        return result({ success: true, method, value: value === undefined ? null : value });
      } catch (error) {
        return { ...result({ success: false, error: error instanceof Error ? error.message : String(error) }), isError: true };
      }
    },
  },
  {
    tool: {
      name: 'geogebra_api_get_callback_events',
      description: 'Read events captured from persistent GeoGebra Apps API listeners registered through geogebra_api_call. Set clear=false to read without clearing the queue.',
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
      inputSchema: { type: 'object', properties: { callbackId: { type: 'string', minLength: 1, maxLength: 80 }, clear: { type: 'boolean', default: true } }, required: ['callbackId'], additionalProperties: false },
    },
    handler: async params => {
      try {
        const events = await (await instancePool.getDefaultInstance()).readAppsApiCallbackEvents(params['callbackId'] as string, params['clear'] !== false);
        return result({ success: true, callbackId: params['callbackId'], events });
      } catch (error) {
        return { ...result({ success: false, error: error instanceof Error ? error.message : String(error) }), isError: true };
      }
    },
  },
];
