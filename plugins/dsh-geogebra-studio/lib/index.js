/**
 * Host half of the GeoGebra Studio plugin for DeepSeek Harness.
 *
 * Registers four model-facing tools (`geogebra_build`, `geogebra_status`,
 * `geogebra_preview`, `geogebra_export`) over the bundled generator runtime,
 * contributes the `geogebra-studio` skill, and bridges the latest construction
 * of each Session to the right-Sidebar canvas through three loopback routes:
 *
 * - `/dsh-geogebra-studio/state` returns the Session's latest render version.
 * - `/dsh-geogebra-studio/viewer` returns the blank or populated viewer HTML
 *   that the right-Sidebar tab embeds, with a compact viewer header
 *   (objects toggle, theme, light/dark and downloads).
 * - `/dsh-geogebra-studio/report` receives what that canvas actually rendered,
 *   so `geogebra_status` can verify a build without a second browser.
 *
 * The Client half (`lib/client.js`) owns the sidebar entry, the right tab and
 * its canvas; this module never writes UI itself.
 */
import { readFileSync } from 'node:fs'
import { readFile, realpath, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  cleanWithGikz,
  constructionHtml,
  exportSource,
  generateViewer,
  inWorkspace,
  previewViewer,
  saveText,
  sceneFromXML,
  validateViewerSpec,
} from '../runtime/geogebra.mjs'

export const name = 'dsh-geogebra-studio'

/** Tools are required; the skill registry and web server are claimed when mounted. */
export const inject = ['tools']

const PLUGIN_DIR = fileURLToPath(new URL('..', import.meta.url))
const SKILL_DIR = path.join(PLUGIN_DIR, 'skills', 'geogebra-studio')
const SKILL_FILE = path.join(SKILL_DIR, 'SKILL.md')
const PREVIEW_LIMIT = 4
const RENDER_LIMIT = 32
const STATE_PATH = '/dsh-geogebra-studio/state'
const VIEWER_PATH = '/dsh-geogebra-studio/viewer'
const REPORT_PATH = '/dsh-geogebra-studio/report'
const REPORT_BYTES = 64 * 1024
const REPORT_SESSIONS = 32
const STATUS_WAIT_MAX = 15000

/** A blank, axes-on construction for the right-side canvas before any build. */
const BLANK_SPEC = { filename: 'geogebra-panel.html', commands: [], showAxes: true, mode: '2D' }

const SPEC_OPTIONS = {
  filename: {
    type: 'string',
    description: 'New HTML file path relative to the workspace; it must end in .html and must not already exist.',
  },
  commands: {
    type: 'array',
    items: { type: 'string' },
    description: 'GeoGebra commands evaluated in order. Keep dependencies explicit instead of freezing coordinates.',
  },
  ggbBase64: {
    type: 'string',
    description: 'Base64 of an existing .ggb file; use instead of commands to reopen saved work.',
  },
  title: { type: 'string' },
  width: { type: 'number' },
  height: { type: 'number' },
  showAxes: { type: 'boolean' },
  visibleLabels: { type: 'array', items: { type: 'string' } },
  captionOverrides: { type: 'object' },
  mode: { type: 'string', enum: ['2D', '3D'] },
  view3D: { type: 'object' },
  labelOffsets: {
    type: 'object',
    description: 'Per-object label offsets in world units: [dx,dy] in 2D, [dx,dy,dz] in 3D. Use it when a line through a labelled point covers that label.',
  },
}

const BUILD_OUTPUT = {
  type: 'object',
  additionalProperties: false,
  required: ['success', 'htmlPath', 'filename', 'bytes', 'note'],
  properties: {
    success: { type: 'boolean' },
    htmlPath: { type: 'string' },
    filename: { type: 'string' },
    bytes: { type: 'integer' },
    note: { type: 'string' },
  },
}

const EXPORT_OUTPUT = {
  type: 'object',
  additionalProperties: false,
  required: ['success', 'format', 'outputPath', 'bytes', 'complete'],
  properties: {
    success: { type: 'boolean' },
    format: { type: 'string' },
    outputPath: { type: 'string' },
    bytes: { type: 'integer' },
    complete: { type: 'boolean' },
  },
}

const STATUS_OUTPUT = {
  type: 'object',
  additionalProperties: false,
  required: [
    'canvas', 'reportVersion', 'renderVersion', 'error', 'failedCommand',
    'warnings', 'objectCount', 'undefinedVisibleObjects', 'equalAxes',
    'ageMs', 'waitedMs', 'note',
  ],
  properties: {
    canvas: { type: 'string', enum: ['ready', 'error', 'stale', 'pending', 'unavailable'] },
    reportVersion: { type: 'integer' },
    renderVersion: { type: 'integer' },
    error: { type: 'string' },
    failedCommand: { type: 'string' },
    warnings: { type: 'array', items: { type: 'string' } },
    objectCount: { type: 'integer' },
    undefinedVisibleObjects: { type: 'array', items: { type: 'string' } },
    equalAxes: { type: 'boolean' },
    ageMs: { type: 'integer' },
    waitedMs: { type: 'integer' },
    note: { type: 'string' },
  },
}

const PREVIEW_OUTPUT = {
  type: 'object',
  additionalProperties: false,
  required: ['url', 'file', 'note'],
  properties: {
    url: { type: 'string' },
    file: { type: 'string' },
    note: { type: 'string' },
  },
}

/** Resolve the workspace from the tool argument or the owning session's cwd. */
async function resolveWorkspace(value, exec) {
  const candidate = value ?? exec?.agent?.session?.header?.cwd
  if (typeof candidate !== 'string' || !path.isAbsolute(candidate)) {
    throw new Error('workspace must be an absolute directory path; pass workspace explicitly when the session has no cwd')
  }
  const root = await realpath(candidate)
  if (!(await stat(root)).isDirectory()) throw new Error('workspace must be a directory')
  return root
}

/** Resolve an existing file inside the workspace, rejecting symlink escapes. */
async function resolveExistingFile(input, workspace) {
  if (typeof input !== 'string' || input.trim() === '') throw new Error('input path must be a nonempty string')
  const root = await realpath(workspace)
  const target = path.isAbsolute(input) ? input : path.resolve(root, input)
  const real = await realpath(target)
  if (real !== root && !real.startsWith(root + path.sep)) throw new Error('input path is outside workspace')
  return real
}

/** Refuse writes when the session's file policy is read-only. */
function assertWritable(ctx, exec) {
  if (!exec?.agent) return
  const policy = typeof ctx.get === 'function' ? ctx.get('sandboxPolicy') : undefined
  const mode = policy?.resolve?.({ session: exec.agent.session })?.mode
  if (mode === 'read-only') {
    throw new Error('the session file policy is read-only; GeoGebra Studio needs workspace write access')
  }
}

/** Read a skill body without its discovery frontmatter. */
function readSkillBody() {
  const source = readFileSync(SKILL_FILE, 'utf8')
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
}

/** Register the bundled skill when the profile mounts a skill registry. */
function contributeSkill(ctx) {
  ctx.inject(['skills'], (skillsCtx) => {
    const content = readSkillBody()
    skillsCtx.effect(() => skillsCtx.skills.register({
      name: 'geogebra-studio',
      description: 'Create, inspect, edit, and export interactive 2D/3D GeoGebra constructions as local HTML, with TikZ, Asymptote and TSQX source workflows.',
      content,
      resourceBase: { kind: 'directory', path: SKILL_DIR },
      source: 'runtime',
    }))
  })
}

/** Write one plain response. */
function send(response, status, headers, body) {
  response.writeHead(status, headers)
  response.end(body)
}

/** Read a bounded JSON request body from the canvas reporter. */
async function readJsonBody(request, limit) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > limit) throw new Error('report body is too large')
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  if (size === 0) throw new Error('empty report body')
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

/**
 * Append a reporter to the panel viewer. The canvas iframe runs the official
 * engine, so it can say what it rendered; the agent reads that report through
 * `geogebra_status` instead of starting a headless browser per iteration.
 */
function withStatusReporter(html, session, version) {
  const payload = JSON.stringify({
    endpoint: `${REPORT_PATH}?session=${encodeURIComponent(session)}`,
    version: Number(version) || 0,
  })
  const script = `<script>(function(){var spec=${payload};var sent='';`
    + `function report(){var s=window.geogebraStudio;`
    + `if(!s||(s.status!=='ready'&&s.status!=='error'))return;`
    + `var body=JSON.stringify({version:spec.version,status:s.status,`
    + `completedCommands:s.completedCommands,failedCommand:s.failedCommand||null,`
    + `warnings:(s.warnings||[]).slice(0,20),checks:s.checks||null,`
    + `error:window.ggbError||null});if(body===sent)return;sent=body;`
    + `fetch(spec.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},`
    + `body:body,keepalive:true}).catch(function(){sent=''})}`
    + `setInterval(report,400);report()})();<\/script>`
  return html.includes('</body>') ? html.replace('</body>', `${script}</body>`) : html + script
}

/**
 * Register the GeoGebra tools, the bundled skill and the right-Sidebar bridge.
 * @param ctx - the plugin context.
 */
export function apply(ctx) {
  const previews = new Map()
  const renders = new Map()
  const reports = new Map()
  let sequence = 0
  let panelAvailable = false

  const closePreviews = () => {
    for (const entry of previews.values()) entry.server.close()
    previews.clear()
  }
  ctx.effect(() => () => {
    closePreviews()
    reports.clear()
  })

  const recordRender = (sessionId, spec, htmlPath) => {
    renders.delete(sessionId)
    renders.set(sessionId, { version: ++sequence, spec: { ...spec }, htmlPath })
    while (renders.size > RENDER_LIMIT) {
      const oldest = renders.keys().next().value
      renders.delete(oldest)
    }
  }

  const requestSession = (request) => {
    try {
      return new URL(request.url ?? '/', 'http://127.0.0.1').searchParams.get('session') ?? ''
    } catch {
      return ''
    }
  }

  const stateHandler = (request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      send(response, 405, { Allow: 'GET, HEAD' }, '')
      return
    }
    const render = renders.get(requestSession(request))
    // The canvas only needs the version to reload; never ship a large GGB
    // payload back on every poll.
    const body = JSON.stringify(render === undefined
      ? { version: 0, htmlPath: null }
      : { version: render.version, htmlPath: render.htmlPath })
    send(response, 200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    }, request.method === 'HEAD' ? '' : body)
  }

  const viewerHandler = (request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      send(response, 405, { Allow: 'GET, HEAD' }, '')
      return
    }
    const render = renders.get(requestSession(request))
    let body
    try {
      body = withStatusReporter(
        constructionHtml({ ...(render?.spec ?? BLANK_SPEC), layout: 'panel' }),
        requestSession(request),
        render?.version ?? 0,
      )
    } catch (error) {
      send(response, 500, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }, String(error))
      return
    }
    send(response, 200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    }, request.method === 'HEAD' ? '' : body)
  }

  const reportHandler = async (request, response) => {
    if (request.method !== 'POST') {
      send(response, 405, { Allow: 'POST' }, '')
      return
    }
    const session = requestSession(request)
    if (session === '') {
      send(response, 400, { 'Content-Type': 'text/plain; charset=utf-8' }, 'session is required')
      return
    }
    let payload
    try {
      payload = await readJsonBody(request, REPORT_BYTES)
    } catch (error) {
      send(response, 400, { 'Content-Type': 'text/plain; charset=utf-8' }, String(error))
      return
    }
    if (!payload || (payload.status !== 'ready' && payload.status !== 'error')) {
      send(response, 400, { 'Content-Type': 'text/plain; charset=utf-8' }, 'status must be ready or error')
      return
    }
    const checks = payload.checks && typeof payload.checks === 'object' ? payload.checks : null
    reports.set(session, {
      version: Number(payload.version) || 0,
      status: payload.status,
      completedCommands: Number(payload.completedCommands) || 0,
      failedCommand: typeof payload.failedCommand === 'string' ? payload.failedCommand : '',
      warnings: Array.isArray(payload.warnings) ? payload.warnings.slice(0, 20).map(String) : [],
      checks,
      error: typeof payload.error === 'string' ? payload.error : '',
      receivedAt: Date.now(),
    })
    while (reports.size > REPORT_SESSIONS) reports.delete(reports.keys().next().value)
    send(response, 204, { 'Cache-Control': 'no-store' }, '')
  }

  ctx.inject(['webServer'], (webCtx) => {
    panelAvailable = true
    webCtx.effect(() => webCtx.webServer.register({ kind: 'exact', path: STATE_PATH, handler: stateHandler }), 'geogebra-studio: state route')
    webCtx.effect(() => webCtx.webServer.register({ kind: 'exact', path: VIEWER_PATH, handler: viewerHandler }), 'geogebra-studio: viewer route')
    webCtx.effect(() => webCtx.webServer.register({ kind: 'exact', path: REPORT_PATH, handler: reportHandler }), 'geogebra-studio: report route')
  })

  contributeSkill(ctx)

  ctx.tools.register({
    name: 'geogebra_build',
    description: 'Create an editable, interactive GeoGebra HTML figure from a JSON construction spec and save it as a new file in the workspace. Generation validates the spec and writes the file but does not execute the geometry. On success, the DSH right-side GeoGebra Studio canvas updates to the same construction; open the HTML with geogebra_preview only for a standalone link. Existing files are never overwritten.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        spec: {
          type: 'object',
          description: 'Construction spec. Provide either spec or specPath. Required field: filename; provide commands or ggbBase64.',
          properties: SPEC_OPTIONS,
        },
        specPath: {
          type: 'string',
          description: 'Path to a JSON construction spec inside the workspace; use instead of spec.',
        },
        workspace: {
          type: 'string',
          description: 'Absolute directory that confines the input spec and the generated file. Defaults to the session working directory.',
        },
      },
    },
    output: {
      schema: BUILD_OUTPUT,
      render: (_args, value) => [{
        type: 'text',
        text: `Created ${value.htmlPath} (${value.bytes} bytes). ${value.note}`,
      }],
    },
    async execute(args, exec) {
      assertWritable(ctx, exec)
      const workspace = await resolveWorkspace(args.workspace, exec)
      let raw = args.spec
      if (raw === undefined) {
        if (typeof args.specPath !== 'string') throw new Error('Provide spec or specPath')
        raw = JSON.parse(await readFile(await resolveExistingFile(args.specPath, workspace), 'utf8'))
      } else if (args.specPath !== undefined) {
        throw new Error('Provide either spec or specPath, not both')
      }
      const spec = validateViewerSpec(raw)
      const result = await generateViewer(spec, workspace)
      const htmlPath = result.filename
      const sessionId = exec?.agent?.session?.id
      if (sessionId !== undefined) recordRender(String(sessionId), spec, htmlPath)
      return {
        success: true,
        htmlPath,
        filename: path.basename(htmlPath),
        bytes: (await stat(htmlPath)).size,
        note: panelAvailable
          ? 'The right-side GeoGebra Studio canvas now shows this construction. Call geogebra_status to read what that canvas rendered instead of opening a browser. Rendering there loads the official engine and needs network access.'
          : result.note,
      }
    },
  })

  ctx.tools.register({
    name: 'geogebra_status',
    description: 'Read what the right-side GeoGebra Studio canvas actually rendered for this session: status, failed command, undefined visible objects, equal-axis check and warnings. Call it after geogebra_build instead of opening a browser; it reflects the canvas the user is already watching.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        waitMs: {
          type: 'integer',
          description: 'How long to wait for the canvas to report this build, 0..15000. Defaults to 0.',
        },
      },
    },
    output: {
      schema: STATUS_OUTPUT,
      render: (_args, value) => [{
        type: 'text',
        text: value.canvas === 'ready'
          ? `Canvas ready: ${value.objectCount} objects, no undefined visible objects.`
          : `Canvas ${value.canvas}: ${value.note}`,
      }],
    },
    async execute(args, exec) {
      const session = exec?.agent?.session?.id
      if (session === undefined) throw new Error('geogebra_status needs an active session')
      const id = String(session)
      const render = renders.get(id)
      const requested = Number.isFinite(args.waitMs) ? Number(args.waitMs) : 0
      const waitMs = Math.min(Math.max(Math.trunc(requested), 0), STATUS_WAIT_MAX)
      const started = Date.now()
      const matches = () => reports.has(id) && render !== undefined && reports.get(id).version === render.version
      while (!matches() && Date.now() - started < waitMs) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      const waitedMs = Date.now() - started
      const report = reports.get(id)
      const checks = report?.checks ?? null
      const base = {
        reportVersion: report?.version ?? -1,
        renderVersion: render?.version ?? -1,
        error: report?.error ?? '',
        failedCommand: report?.failedCommand ?? '',
        warnings: report?.warnings ?? [],
        objectCount: Number.isFinite(checks?.objectCount) ? Number(checks.objectCount) : -1,
        undefinedVisibleObjects: Array.isArray(checks?.undefinedVisibleObjects)
          ? checks.undefinedVisibleObjects.map(String).slice(0, 20)
          : [],
        equalAxes: checks?.equalAxes === true,
        ageMs: report ? Math.max(0, Date.now() - report.receivedAt) : -1,
        waitedMs,
      }
      if (render === undefined) {
        return { canvas: 'unavailable', ...base, note: 'No construction has been built in this session yet.' }
      }
      if (report === undefined) {
        return { canvas: 'pending', ...base, note: 'The canvas has not reported yet. Open the GeoGebra Studio tab in the left sidebar and let it render.' }
      }
      if (report.version !== render.version) {
        return { canvas: 'stale', ...base, note: `The canvas last rendered version ${report.version}; the latest build is ${render.version}. Keep the GeoGebra tab open so it reloads.` }
      }
      if (report.status === 'error') {
        return {
          canvas: 'error',
          ...base,
          note: report.error || (report.failedCommand ? `Command failed: ${report.failedCommand}` : 'The canvas reported an error.'),
        }
      }
      return { canvas: 'ready', ...base, note: 'The right canvas rendered this build; no browser was opened.' }
    },
  })

  ctx.tools.register({
    name: 'geogebra_preview',
    description: 'Serve one generated GeoGebra HTML file from a standalone loopback HTTP server and return its URL. The right-side canvas already updates after geogebra_build, so use this only when a separate link or a full browser tab is wanted. Each call snapshots the current file; the oldest preview is closed after four open files.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        file: {
          type: 'string',
          description: 'Generated .html file, as an absolute path or a path relative to the workspace.',
        },
        workspace: {
          type: 'string',
          description: 'Absolute directory that contains the HTML file. Defaults to the session working directory.',
        },
      },
      required: ['file'],
    },
    output: {
      schema: PREVIEW_OUTPUT,
      render: (_args, value) => [{
        type: 'text',
        text: `Standalone preview: ${value.url}\nOpen this URL in a browser and keep the session running. The server serves only this document snapshot.`,
      }],
    },
    async execute(args, exec) {
      const workspace = await resolveWorkspace(args.workspace, exec)
      const file = await resolveExistingFile(args.file, workspace)
      if (!/\.html$/i.test(file)) throw new Error('Preview input must be an HTML file')
      const previous = previews.get(file)
      if (previous) {
        previous.server.close()
        previews.delete(file)
      }
      const preview = await previewViewer(file, workspace)
      previews.set(file, preview)
      while (previews.size > PREVIEW_LIMIT) {
        const oldest = previews.keys().next().value
        previews.get(oldest).server.close()
        previews.delete(oldest)
      }
      return {
        url: preview.url,
        file: preview.filename,
        note: 'Loopback preview of one HTML snapshot. The server closes when the plugin unloads.',
      }
    },
  })

  ctx.tools.register({
    name: 'geogebra_export',
    description: 'Export geometry source from a GeoGebra XML file (strict semantic TSQX or Asymptote) or clean a native GeoGebra PGF export into TikZ. Writes a new file in the workspace and rejects unsupported relations instead of freezing them into fixed coordinates.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        input: {
          type: 'string',
          description: 'Existing XML (.xml) or native PGF (.pgf) file, absolute or relative to the workspace.',
        },
        format: {
          type: 'string',
          enum: ['tsqx', 'asymptote', 'tikz'],
          description: 'tsqx and asymptote read GeoGebra XML; tikz reads native PGF output.',
        },
        output: {
          type: 'string',
          description: 'New output file path relative to the workspace. Must not already exist.',
        },
        workspace: {
          type: 'string',
          description: 'Absolute directory that confines the input and output. Defaults to the session working directory.',
        },
        standalone: {
          type: 'boolean',
          description: 'Wrap TikZ in a standalone document. Defaults to true.',
        },
      },
      required: ['input', 'format', 'output'],
    },
    output: {
      schema: EXPORT_OUTPUT,
      render: (_args, value) => [{
        type: 'text',
        text: `Exported ${value.format} source to ${value.outputPath} (${value.bytes} bytes).`,
      }],
    },
    async execute(args, exec) {
      assertWritable(ctx, exec)
      const workspace = await resolveWorkspace(args.workspace, exec)
      const input = await resolveExistingFile(args.input, workspace)
      const source = await readFile(input, 'utf8')
      const standalone = args.standalone !== false
      let code
      let complete = true
      if (args.format === 'tikz') {
        if (/<geogebra[\s>]/.test(source)) {
          throw new Error('TikZ export reads native GeoGebra PGF output, not XML. Use tsqx or asymptote for XML, or download PGF from the viewer.')
        }
        code = await cleanWithGikz(source, { standalone })
      } else {
        const result = exportSource(sceneFromXML(source), args.format, true, standalone)
        code = result.code
        complete = result.complete
      }
      const outputPath = await inWorkspace(workspace, () => saveText(args.output, code))
      return {
        success: true,
        format: args.format,
        outputPath,
        bytes: Buffer.byteLength(code),
        complete,
      }
    },
  })
}
