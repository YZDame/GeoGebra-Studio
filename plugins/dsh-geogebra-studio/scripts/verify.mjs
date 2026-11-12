/**
 * Verify the DeepSeek Harness plugin without a running DSH web session.
 *
 * Checks the bundle contract, manifest, locale resources, icon, the bundled
 * skill, the Client sidebar factory, and then executes every Host tool against
 * a temporary workspace. Preview is exercised over real loopback HTTP.
 */
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import vm from 'node:vm'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
const patch = await readFile(join(root, 'cordis.patch.yml'), 'utf8')
const bundle = await readFile(join(root, 'lib/client.js'), 'utf8')
const host = await import(pathToFileURL(join(root, 'lib/index.js')).href)

const failures = []
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${detail === '' ? '' : ` — ${detail}`}`)
  if (!ok) failures.push(label)
}

async function rejects(label, run) {
  try {
    await run()
    check(label, false, 'resolved instead of rejecting')
  } catch {
    check(label, true)
  }
}

const SCHEMA_KEYWORDS = new Set([
  'type', 'oneOf', 'properties', 'required', 'additionalProperties', 'items',
  'enum', 'const', 'description', 'title', 'default', 'examples',
])

/** Walk a raw JSON Schema and reject keywords outside the DSH subset. */
function schemaViolations(node, path = '$') {
  if (node === null || typeof node !== 'object' || Array.isArray(node)) return [`${path}: not a schema object`]
  const violations = []
  for (const key of Object.keys(node)) {
    if (!SCHEMA_KEYWORDS.has(key)) violations.push(`${path}.${key}: unsupported keyword`)
  }
  for (const [name, child] of Object.entries(node.properties ?? {})) {
    violations.push(...schemaViolations(child, `${path}.properties.${name}`))
  }
  if (node.items) violations.push(...schemaViolations(node.items, `${path}.items`))
  for (const [index, branch] of (node.oneOf ?? []).entries()) {
    violations.push(...schemaViolations(branch, `${path}.oneOf[${index}]`))
  }
  return violations
}

// ---------------------------------------------------------------- manifest
check('package name', pkg.name === 'dsh-geogebra-studio', pkg.name)
check('GPL-2.0-or-later', pkg.license === 'GPL-2.0-or-later', pkg.license)
check('bundle patch path', pkg.dsh?.bundle?.patch === './cordis.patch.yml')
check('client export', pkg.exports?.['./client'] === './lib/client.js')
check('locale export', pkg.exports?.['./locale/*.json'] === './locale/*.json')
check('icon export', pkg.exports?.['./icon'] === './icon.svg')
check('client platform web', pkg.dsh?.client?.platform === 'web')
check('client injects the sidebar package', pkg.dsh?.client?.inject?.includes('@deepseek-ai/dsh-client-ui-sidebar') === true)
check('patch inserts this plugin', patch.includes('id: dsh-geogebra-studio') && patch.includes('name: dsh-geogebra-studio'))
for (const entry of ['lib/', 'runtime/', 'skills/', 'locale/*.json', 'icon.svg', 'cordis.patch.yml', 'README.md']) {
  check(`files includes ${entry}`, Array.isArray(pkg.files) && pkg.files.includes(entry))
}

// ------------------------------------------------------------------ locale
for (const language of ['en', 'zh']) {
  const locale = JSON.parse(await readFile(join(root, 'locale', `${language}.json`), 'utf8'))
  check(`${language} title`, typeof locale.meta?.title === 'string' && locale.meta.title.length > 0)
  check(`${language} description`, typeof locale.meta?.description === 'string' && locale.meta.description.length > 40)
  check(`${language} description names the tools`, locale.meta?.description?.includes('geogebra_'))
  check(`${language} has no detail document`, locale.meta?.detail === undefined)
}

// -------------------------------------------------------------------- icon
const icon = await readFile(join(root, 'icon.svg'), 'utf8')
check('icon is 36x36', icon.includes('width="36"') && icon.includes('height="36"') && icon.includes('viewBox="0 0 36 36"'))
check('icon has no scripts or foreign content', !/<script|foreignObject|<image|<style|<text/i.test(icon))
check('icon fits the size limit', (await stat(join(root, 'icon.svg'))).size <= 256 * 1024)

// ------------------------------------------------------------------- host
check('host name', host.name === 'dsh-geogebra-studio', String(host.name))
check('host injects tools', Array.isArray(host.inject) && host.inject.includes('tools'))
check('host apply', typeof host.apply === 'function')

let sandboxMode = 'workspace-write'
const tools = new Map()
const skills = []
const effects = []
const ctx = {
  tools: {
    register(definition) {
      if (tools.has(definition.name)) throw new Error(`duplicate tool ${definition.name}`)
      tools.set(definition.name, definition)
      return () => tools.delete(definition.name)
    },
  },
  get(name) {
    if (name !== 'sandboxPolicy') return undefined
    return { resolve: () => ({ mode: sandboxMode }) }
  },
  skills: {
    register(skill) {
      skills.push(skill)
      return () => {}
    },
  },
  inject(_dependencies, callback) {
    callback(ctx)
    return () => {}
  },
  effect(run) {
    effects.push(run())
    return () => {}
  },
}
host.apply(ctx)

check('registers three tools', [...tools.keys()].join(',') === 'geogebra_build,geogebra_preview,geogebra_export', [...tools.keys()].join(','))
for (const [name, definition] of tools) {
  check(`${name} has a description`, typeof definition.description === 'string' && definition.description.length > 40)
  check(`${name} renders output`, definition.output !== undefined && typeof definition.output.render === 'function')
  const violations = [
    ...schemaViolations(definition.parameters, `${name}.parameters`),
    ...schemaViolations(definition.output.schema, `${name}.output`),
  ]
  check(`${name} schema stays inside the DSH subset`, violations.length === 0, violations.slice(0, 3).join('; '))
}

// ------------------------------------------------------------------- skill
check('registers one runtime skill', skills.length === 1, String(skills.length))
const skill = skills[0]
check('skill name', skill?.name === 'geogebra-studio', skill?.name)
check('skill content', typeof skill?.content === 'string' && skill.content.includes('# GeoGebra Studio') && !skill.content.startsWith('---'))
check('skill resolves its resource base', skill?.resourceBase?.kind === 'directory' && existsSync(join(skill.resourceBase.path, 'references', 'construction.md')))
check('skill documents the plugin tools', ['geogebra_build', 'geogebra_preview', 'geogebra_export'].every((name) => skill?.content.includes(name)))

// ---------------------------------------------------------------- tools
const workspace = await mkdtemp(join(tmpdir(), 'ggb-dsh-verify-'))
const exec = {
  agent: { session: { header: { cwd: workspace } } },
  signal: new AbortController().signal,
}
const build = tools.get('geogebra_build')
const preview = tools.get('geogebra_preview')
const exporter = tools.get('geogebra_export')

const spec = {
  filename: 'verify.html',
  commands: ['A=(0,0)', 'B=(4,0)', 'c=Circle(A,B)'],
  visibleLabels: ['A', 'B'],
  showAxes: true,
}
const built = await build.execute({ spec }, exec)
check('build returns the HTML path', typeof built.htmlPath === 'string' && built.htmlPath.endsWith('verify.html'))
check('build wrote the HTML', existsSync(built.htmlPath))
const html = await readFile(built.htmlPath, 'utf8')
check('HTML embeds the viewer', html.includes('id="ggb-element"') && html.includes('geogebraStudio'))
check('HTML embeds the commands', html.includes('A=(0,0)') && html.includes('Circle(A,B)'))
check('build reports the real size', built.bytes === (await stat(built.htmlPath)).size)
await rejects('build never overwrites', () => build.execute({ spec }, exec))

await writeFile(join(workspace, 'spec.json'), JSON.stringify({ ...spec, filename: 'from-path.html' }))
const fromPath = await build.execute({ specPath: 'spec.json' }, exec)
check('build accepts a spec path', existsSync(fromPath.htmlPath) && fromPath.filename === 'from-path.html')
await rejects('build rejects both spec sources', () => build.execute({ spec, specPath: 'spec.json' }, exec))
await rejects('build rejects a relative workspace', () => build.execute({ spec, workspace: 'output' }, exec))

const xml = '<geogebra><construction>'
  + '<element label="A" type="point"><coords x="0" y="0" z="1"/><show object="true" label="true"/></element>'
  + '<element label="B" type="point"><coords x="4" y="0" z="1"/><show object="true" label="true"/></element>'
  + '<command name="Midpoint"><input a0="A" a1="B"/><output a0="M"/></command>'
  + '<element label="M" type="point"><coords x="2" y="0" z="1"/><show object="true" label="true"/></element>'
  + '</construction></geogebra>'
await writeFile(join(workspace, 'figure.xml'), xml)

const tsqx = await exporter.execute({ input: 'figure.xml', format: 'tsqx', output: 'figure.tsqx' }, exec)
check('tsqx export writes source', existsSync(tsqx.outputPath) && tsqx.bytes > 0 && tsqx.complete === true)
const asy = await exporter.execute({ input: 'figure.xml', format: 'asymptote', output: 'figure.asy' }, exec)
check('asymptote export writes source', existsSync(asy.outputPath) && asy.bytes > 0)
await rejects('tikz rejects XML input', () => exporter.execute({ input: 'figure.xml', format: 'tikz', output: 'bad.tex' }, exec))
await rejects('export never overwrites', () => exporter.execute({ input: 'figure.xml', format: 'tsqx', output: 'figure.tsqx' }, exec))

await writeFile(join(workspace, 'native.tex'), '\\begin{tikzpicture}\\draw (0,0)--(1,1);\\end{tikzpicture}')
const tikz = await exporter.execute({ input: 'native.tex', format: 'tikz', output: 'figure.tex' }, exec)
check('tikz export writes a tikzpicture', existsSync(tikz.outputPath) && (await readFile(tikz.outputPath, 'utf8')).includes('\\begin{tikzpicture}'))

await writeFile(join(workspace, '..', 'ggb-dsh-outside.xml'), xml).catch(() => {})
await rejects('input paths stay inside the workspace', () => exporter.execute({ input: join(workspace, '..', 'ggb-dsh-outside.xml'), format: 'tsqx', output: 'x.tsqx' }, exec))

const served = await preview.execute({ file: 'verify.html' }, exec)
check('preview returns a loopback URL', /^http:\/\/127\.0\.0\.1:\d+\/viewer\.html$/.test(served.url), served.url)
const response = await fetch(served.url)
const servedHtml = await response.text()
check('preview serves the document', response.status === 200 && servedHtml.includes('id="ggb-element"'))
check('preview sets the HTML content type', response.headers.get('content-type')?.startsWith('text/html') === true)
const again = await preview.execute({ file: 'verify.html' }, exec)
check('preview replaces its snapshot', again.url !== served.url || again.file.endsWith('verify.html'))
await rejects('preview only serves HTML', () => preview.execute({ file: 'figure.xml' }, exec))

sandboxMode = 'read-only'
await rejects('build respects a read-only session policy', () => build.execute({ spec }, exec))
await rejects('export respects a read-only session policy', () => exporter.execute({ input: 'figure.xml', format: 'tsqx', output: 'blocked.tsqx' }, exec))
sandboxMode = 'workspace-write'

await rm(workspace, { recursive: true, force: true })
await rm(join(workspace, '..', 'ggb-dsh-outside.xml'), { force: true })

// ------------------------------------------------------------------ client
check('ModuleLoader banner', bundle.startsWith('window.__ModuleLoader__.load({'))
check('loader id', /^ id: "dsh-geogebra-studio",$/m.test(bundle))
check('no ESM import', !/^import[\s{]/m.test(bundle))
check('no bundled react', !/react\.production\.min/.test(bundle))

const allowed = [
  /^react$/,
  /^react\/jsx-runtime$/,
  /^react\/jsx-dev-runtime$/,
  /^react-dom$/,
  /^react-dom\/client$/,
  /^@deepseek-ai\//,
]
const required = [...bundle.matchAll(/\brequire\("([^"]+)"\)/g)].map((match) => match[1])
const unique = [...new Set(required)]
const unexpected = unique.filter((specifier) => !allowed.some((pattern) => pattern.test(specifier)))
check('requires stay on the shell module table', unexpected.length === 0, unexpected.join(', '))
check('client mentions the tools', ['geogebra_build', 'geogebra_preview', 'geogebra_export'].every((name) => bundle.includes(name)))

const registrations = []
const dictionaries = []
let loaded
const sandbox = {
  window: {
    __ModuleLoader__: {
      load(options) {
        loaded = {
          id: options.id,
          exports: options.factory((id) => {
            if (id === 'react') {
              return {
                useState(initial) {
                  const value = typeof initial === 'function' ? initial() : initial
                  return [value, () => {}]
                },
                useEffect(effect) {
                  const cleanup = effect()
                  if (typeof cleanup === 'function') cleanup()
                },
              }
            }
            if (id === 'react/jsx-runtime' || id === 'react/jsx-dev-runtime') {
              const create = (type, props, key) => ({ type, props: props ?? {}, key })
              return { jsx: create, jsxs: create, jsxDEV: create, Fragment: Symbol.for('react.fragment') }
            }
            if (id === 'react-dom' || id === 'react-dom/client') {
              return { createPortal: (node) => node }
            }
            throw new Error(`unexpected require: ${id}`)
          }),
        }
      },
    },
  },
  console,
  document: undefined,
  navigator: { clipboard: { writeText: async () => {} } },
}

vm.runInNewContext(bundle, sandbox, { filename: 'lib/client.js' })
check('factory loads', loaded?.id === 'dsh-geogebra-studio', loaded?.id)
check('client apply', typeof loaded?.exports.apply === 'function')
check('client injects slots and locale', loaded?.exports.inject?.includes('slots') && loaded?.exports.inject?.includes('locale'))

loaded.exports.apply({
  locale: {
    bind: () => (key) => key,
    register: (namespace, packs) => {
      dictionaries.push({ namespace, packs })
      return () => {}
    },
  },
  effect(run) {
    const dispose = run()
    return typeof dispose === 'function' ? dispose : () => {}
  },
  slots: {
    inject(name, register) {
      registrations.push({ injected: name })
      register()
      return () => {}
    },
    register(options, component) {
      registrations.push({ options, component })
      return () => {}
    },
  },
})

const button = registrations.find((entry) => entry.options?.name === 'sidebar.footer.action')
check('registers sidebar.footer.action', button !== undefined)
check('footer id', button?.options.id === 'dsh-geogebra-studio', button?.options.id)
check('locale namespace', dictionaries.some((entry) => entry.namespace === 'geogebraStudio' && entry.packs.en && entry.packs.zh))

const wide = button.component({ wide: true, t: (key) => ({ label: 'GeoGebra', title: 'GeoGebra Studio' })[key] ?? key })
const flat = JSON.stringify(wide)
check('wide button shows the GeoGebra label', flat.includes('"data-wide":"true"') && flat.includes('"children":"GeoGebra"'))
const rail = button.component({ wide: false, t: (key) => ({ label: 'GeoGebra', title: 'GeoGebra Studio' })[key] ?? key })
const railText = JSON.stringify(rail)
check('rail button hides the text label', railText.includes('"data-wide":"false"') && !railText.includes('"children":"GeoGebra"'))

if (failures.length > 0) {
  console.error(`plugin verification failed: ${failures.join(', ')}`)
  process.exit(1)
}
console.log('dsh plugin contract and tools OK')
// Preview listeners belong to the live plugin and are intentionally not closed
// by a tool call; end the verifier once its assertions are done.
process.exit(0)
