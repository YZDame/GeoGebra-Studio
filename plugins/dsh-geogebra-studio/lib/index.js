/**
 * Host half of the GeoGebra Studio plugin for DeepSeek Harness.
 *
 * Registers three model-facing tools (`geogebra_build`, `geogebra_preview`,
 * `geogebra_export`) over the bundled generator runtime, and contributes the
 * `geogebra-studio` skill that documents the construction format and the
 * export provenance rules. The Client half is the sidebar quick-start panel
 * in `lib/client.js`.
 */
import { readFileSync } from 'node:fs'
import { readFile, realpath, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  cleanWithGikz,
  exportSource,
  generateViewer,
  inWorkspace,
  previewViewer,
  saveText,
  sceneFromXML,
  validateViewerSpec,
} from '../runtime/geogebra.mjs'

export const name = 'dsh-geogebra-studio'

/** Tools are required; the skill registry is claimed when the profile mounts it. */
export const inject = ['tools']

const PLUGIN_DIR = fileURLToPath(new URL('..', import.meta.url))
const SKILL_DIR = path.join(PLUGIN_DIR, 'skills', 'geogebra-studio')
const SKILL_FILE = path.join(SKILL_DIR, 'SKILL.md')
const PREVIEW_LIMIT = 4

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
  labelOffsets: { type: 'object' },
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

/**
 * Register the GeoGebra tools and the guided workflow.
 * @param ctx - the plugin context.
 */
export function apply(ctx) {
  const previews = new Map()

  const closePreviews = () => {
    for (const entry of previews.values()) entry.server.close()
    previews.clear()
  }
  ctx.effect(() => closePreviews)

  contributeSkill(ctx)

  ctx.tools.register({
    name: 'geogebra_build',
    description: 'Create an editable, interactive GeoGebra HTML figure from a JSON construction spec and save it as a new file in the workspace. Generation validates the spec and writes the file but does not execute the geometry; open it with geogebra_preview to render the official GeoGebra engine. Existing files are never overwritten.',
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
        text: `Created ${value.htmlPath} (${value.bytes} bytes). Start geogebra_preview on it to open a loopback preview. Rendering requires network access to the official GeoGebra engine.`,
      }],
    },
    async execute(args, exec) {
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
      return {
        success: true,
        htmlPath,
        filename: path.basename(htmlPath),
        bytes: (await stat(htmlPath)).size,
        note: result.note,
      }
    },
  })

  ctx.tools.register({
    name: 'geogebra_preview',
    description: 'Serve one generated GeoGebra HTML file from a loopback HTTP server and return its URL, so the browser loads the official engine without file:// restrictions. Each call snapshots the current file; the previous preview of the same file is replaced and the oldest preview is closed after four open files.',
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
        text: `Preview: ${value.url}\nOpen this URL in the browser and keep the session running. The server serves only this document snapshot.`,
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
