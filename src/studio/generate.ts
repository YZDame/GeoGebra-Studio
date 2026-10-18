import { constructionHtml, HtmlOptions } from '../export/html';
import { saveText } from '../export/files';
import { inWorkspace } from '../export/workspace';

export interface ViewerSpec extends HtmlOptions { filename: string }

/** Validate without importing the MCP registry, Puppeteer, or GeoGebra runtime. */
export function validateViewerSpec(value: unknown): ViewerSpec {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected a construction JSON object');
  const p = value as Record<string, unknown>;
  const allowed = new Set(['filename', 'commands', 'ggbBase64', 'title', 'width', 'height', 'showAxes', 'visibleLabels', 'captionOverrides', 'mode', 'view3D', 'labelOffsets']);
  for (const key of Object.keys(p)) if (!allowed.has(key)) throw new Error(`Unknown construction option: ${key}`);
  if (p['mode'] !== undefined && p['mode'] !== '2D' && p['mode'] !== '3D') throw new Error('mode must be 2D or 3D');
  const tuple = (value: unknown, size: number): value is number[] => Array.isArray(value) && value.length === size && value.every(n => typeof n === 'number' && Number.isFinite(n));
  if (p['view3D'] !== undefined) {
    const view = p['view3D'];
    if (!view || typeof view !== 'object' || Array.isArray(view)) throw new Error('view3D must be an object');
    const v = view as Record<string, unknown>;
    if (Object.keys(v).some(k => !['bounds', 'direction'].includes(k))) throw new Error('Unknown view3D option');
    const bounds = v['bounds'];
    if (bounds !== undefined && (!tuple(bounds, 6) || [0, 2, 4].some(i => bounds[i]! >= bounds[i + 1]!))) throw new Error('view3D.bounds must contain xmin < xmax, ymin < ymax, zmin < zmax');
    if (v['direction'] !== undefined && (!tuple(v['direction'], 3) || v['direction'].every(n => n === 0))) throw new Error('view3D.direction must be a nonzero finite 3D vector');
  }
  if (p['labelOffsets'] !== undefined) {
    const offsets = p['labelOffsets'];
    if (!offsets || typeof offsets !== 'object' || Array.isArray(offsets) || Object.values(offsets).some(v => !tuple(v, 3))) throw new Error('labelOffsets must map object names to finite 3D vectors');
  }
  if (typeof p['filename'] !== 'string' || !p['filename'].trim() || !/\.html$/i.test(p['filename'])) throw new Error('filename must end in .html');
  const commands = p['commands'];
  if (commands !== undefined && (!Array.isArray(commands) || commands.length > 2000 || commands.some(c => typeof c !== 'string' || !c.trim() || c.length > 10000))) throw new Error('commands must contain at most 2000 nonempty strings of at most 10000 characters');
  if (p['ggbBase64'] !== undefined && (typeof p['ggbBase64'] !== 'string' || !p['ggbBase64'].trim())) throw new Error('ggbBase64 must be a nonempty string');
  if (!(Array.isArray(commands) && commands.length) && !p['ggbBase64']) throw new Error('Provide nonempty commands or ggbBase64');
  if (p['title'] !== undefined && (typeof p['title'] !== 'string' || p['title'].length > 500)) throw new Error('title must be a string of at most 500 characters');
  for (const key of ['width', 'height']) {
    const size = p[key];
    if (size !== undefined && (typeof size !== 'number' || !Number.isInteger(size) || size < 200 || size > 4000)) throw new Error(`${key} must be an integer between 200 and 4000`);
  }
  if (p['showAxes'] !== undefined && typeof p['showAxes'] !== 'boolean') throw new Error('showAxes must be boolean');
  if (p['visibleLabels'] !== undefined && (!Array.isArray(p['visibleLabels']) || p['visibleLabels'].some(v => typeof v !== 'string'))) throw new Error('visibleLabels must be an array of strings');
  const captions = p['captionOverrides'];
  if (captions !== undefined && (!captions || typeof captions !== 'object' || Array.isArray(captions) || Object.values(captions).some(v => typeof v !== 'string'))) throw new Error('captionOverrides must map object names to strings');
  return p as unknown as ViewerSpec;
}

/** Generation is file-only. Execution and geometry checks happen in the visible viewer. */
export async function generateViewer(value: unknown, workspace: string) {
  const spec = validateViewerSpec(value);
  return inWorkspace(workspace, async () => {
    const filename = await saveText(spec.filename, constructionHtml(spec));
    return { success: true, filename, requiresNetwork: true, engineVerified: false,
      renderVerified: false, execution: 'viewer',
      note: 'Open this HTML in the Codex browser panel. Check geogebraStudio.status and the visible diagram. Download current HTML or GGB to preserve edits.' };
  });
}
