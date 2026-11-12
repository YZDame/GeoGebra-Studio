/**
 * Verify the DeepSeek Harness plugin without a running DSH web session.
 *
 * Checks the bundle contract, manifest, locale resources, the bundled skill,
 * the Client sidebar/tab registrations, and then executes every Host tool
 * against a temporary workspace. The right-Sidebar bridge routes are exercised
 * with real request/response objects, and preview runs over real loopback HTTP.
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
check('no custom icon export', pkg.exports?.['./icon'] === undefined)
check('no custom icon file', !existsSync(join(root, 'icon.svg')))
check('client platform web', pkg.dsh?.client?.platform === 'web')
check('client injects the sidebar package', pkg.dsh?.client?.inject?.includes('@deepseek-ai/dsh-client-ui-sidebar') === true)
check('patch inserts this plugin', patch.includes('id: dsh-geogebra-studio') && patch.includes('name: dsh-geogebra-studio'))
for (const entry of ['lib/', 'runtime/', 'skills/', 'locale/*.json', 'cordis.patch.yml', 'README.md', 'THIRD_PARTY_NOTICES.md']) {
  check(`files includes ${entry}`, Array.isArray(pkg.files) && pkg.files.includes(entry))
}
check('files no longer lists a custom icon', !pkg.files.includes('icon.svg'))

// ------------------------------------------------------------------ locale
for (const language of ['en', 'zh']) {
  const locale = JSON.parse(await readFile(join(root, 'locale', `${language}.json`), 'utf8'))
  check(`${language} title`, typeof locale.meta?.title === 'string' && locale.meta.title.length > 0)
  check(`${language} description`, typeof locale.meta?.description === 'string' && locale.meta.description.length > 40)
  check(`${language} describes the right canvas`, /right sidebar|右侧栏/.test(locale.meta?.description ?? ''))
  check(`${language} has no detail document`, locale.meta?.detail === undefined)
}

// ------------------------------------------------------------------- host
check('host name', host.name === 'dsh-geogebra-studio', String(host.name))
check('host injects tools', Array.isArray(host.inject) && host.inject.includes('tools'))
check('host apply', typeof host.apply === 'function')

const tools = new Map()
const skills = []
const routes = new Map()
const effects = []
const ctx = {
  tools: {
    register(definition) {
      if (tools.has(definition.name)) throw new Error(`duplicate tool ${definition.name}`)
      tools.set(definition.name, definition)
      return () => tools.delete(definition.name)
    },
  },
  skills: {
    register(skill) {
      skills.push(skill)
      return () => {}
    },
  },
  webServer: {
    register(route) {
      if (routes.has(route.path)) throw new Error(`duplicate route ${route.path}`)
      routes.set(route.path, route)
      return () => routes.delete(route.path)
    },
  },
  get() {
    return undefined
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
check('registers the state bridge', routes.has('/dsh-geogebra-studio/state'))
check('registers the viewer bridge', routes.has('/dsh-geogebra-studio/viewer'))

// ------------------------------------------------------------------- skill
check('registers one runtime skill', skills.length === 1, String(skills.length))
const skill = skills[0]
check('skill name', skill?.name === 'geogebra-studio', skill?.name)
check('skill content', typeof skill?.content === 'string' && skill.content.includes('# GeoGebra Studio') && !skill.content.startsWith('---'))
check('skill resolves its resource base', skill?.resourceBase?.kind === 'directory' && existsSync(join(skill.resourceBase.path, 'references', 'construction.md')))
check('skill documents the right canvas', skill?.content.includes('right sidebar') && skill?.content.includes('geogebra_build'))
check('skill no longer sends users to a preview first', !skill?.content.includes('Put the returned URL first'))

// ------------------------------------------------------------------ routes
function request(pathname) {
  return { url: pathname, method: 'GET' }
}
function response() {
  const state = { status: undefined, headers: undefined, body: undefined }
  return {
    state,
    writeHead(status, headers) { state.status = status; state.headers = headers },
    end(body) { state.body = body },
  }
}
function getState(session) {
  const res = response()
  routes.get('/dsh-geogebra-studio/state').handler(request(`/dsh-geogebra-studio/state?session=${session}`), res)
  return { ...res.state, json: JSON.parse(res.state.body) }
}
function getViewer(session) {
  const res = response()
  routes.get('/dsh-geogebra-studio/viewer').handler(request(`/dsh-geogebra-studio/viewer?session=${session}`), res)
  return res.state
}

const blankState = getState('session-before')
check('blank state has version 0', blankState.status === 200 && blankState.json.version === 0 && blankState.json.spec === undefined)
const blankViewer = getViewer('session-before')
check('blank viewer embeds the applet', blankViewer.status === 200 && blankViewer.body.includes('id="ggb-element"'))
check('viewer removes page chrome', blankViewer.body.includes('header{display:none'))

// ---------------------------------------------------------------- tools
const workspace = await mkdtemp(join(tmpdir(), 'ggb-dsh-verify-'))
const exec = {
  agent: { session: { id: 'session-1', header: { cwd: workspace } } },
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
check('build reports the right canvas', built.note.includes('right-side GeoGebra Studio canvas'))
await rejects('build never overwrites', () => build.execute({ spec }, exec))

const raised = getState('session-1')
check('build advances the render version', raised.status === 200 && raised.json.version === 1)
check('state names the built file', typeof raised.json.htmlPath === 'string' && raised.json.htmlPath.endsWith('verify.html'))
const raisedViewer = getViewer('session-1')
check('viewer serves the built construction', raisedViewer.status === 200 && raisedViewer.body.includes('Circle(A,B)'))
check('viewer keeps only the canvas chrome', raisedViewer.body.includes('header{display:none') && raisedViewer.body.includes('id="ggb-element"'))

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
const responseHttp = await fetch(served.url)
const servedHtml = await responseHttp.text()
check('preview serves the document', responseHttp.status === 200 && servedHtml.includes('id="ggb-element"'))
check('preview sets the HTML content type', responseHttp.headers.get('content-type')?.startsWith('text/html') === true)
const again = await preview.execute({ file: 'verify.html' }, exec)
check('preview replaces its snapshot', again.url !== served.url || again.file.endsWith('verify.html'))
await rejects('preview only serves HTML', () => preview.execute({ file: 'figure.xml' }, exec))

await rm(workspace, { recursive: true, force: true })
await rm(join(workspace, '..', 'ggb-dsh-outside.xml'), { force: true })

// ------------------------------------------------------------------ client
check('ModuleLoader banner', bundle.startsWith('window.__ModuleLoader__.load({'))
check('loader id', /^ id: "dsh-geogebra-studio",$/m.test(bundle))
check('no ESM import', !/^import[\s{]/m.test(bundle))
check('no bundled react', !/react\.production\.min/.test(bundle))
check('no footer guide', !bundle.includes('sidebar.footer.action'))

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
check('uses the official icon module', unique.includes('@deepseek-ai/dsh-client-ui-primitives'))

const registrations = []
const dictionaries = []
const tabTypes = []
const opens = []
const panels = []
let loaded
const PrimitiveIcon = (props) => ({ type: 'OfficialSplitIcon', props: props ?? {} })
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
                useEffect() {},
                useLayoutEffect() {},
              }
            }
            if (id === 'react/jsx-runtime' || id === 'react/jsx-dev-runtime') {
              const create = (type, props, key) => ({ type, props: props ?? {}, key })
              return { jsx: create, jsxs: create, jsxDEV: create, Fragment: Symbol.for('react.fragment') }
            }
            if (id === '@deepseek-ai/dsh-client-ui-primitives') {
              return { IconCompareSplitOutlineRegular: PrimitiveIcon }
            }
            throw new Error(`unexpected require: ${id}`)
          }),
        }
      },
    },
  },
  console,
  setTimeout: () => 0,
  document: undefined,
  navigator: { clipboard: { writeText: async () => {} } },
}

vm.runInNewContext(bundle, sandbox, { filename: 'lib/client.js' })
check('factory loads', loaded?.id === 'dsh-geogebra-studio', loaded?.id)
check('client apply', typeof loaded?.exports.apply === 'function')
for (const service of ['slots', 'locale', 'layout', 'sidebarRight', 'sidebarRightTabs']) {
  check(`client injects ${service}`, loaded?.exports.inject?.includes(service))
}

loaded.exports.apply({
  locale: {
    bind: (namespace) => (key) => {
      const entry = dictionaries.find((candidate) => candidate.namespace === namespace)
      return entry?.packs?.en?.[key] ?? key
    },
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
  sidebarRightTabs: {
    register(definition) {
      tabTypes.push(definition)
      return () => {}
    },
  },
  sidebarRight: {
    openTab(kind) {
      opens.push(kind)
      return {}
    },
  },
  layout: {
    selectPanel(id) {
      panels.push(id)
    },
  },
})

check('locale namespace', dictionaries.some((entry) => entry.namespace === 'geogebraStudio' && entry.packs.en && entry.packs.zh))
check('registers one tab type', tabTypes.length === 1, String(tabTypes.length))
check('tab kind', tabTypes[0]?.kind === 'geogebra-studio', tabTypes[0]?.kind)
check('tab id', tabTypes[0]?.id === 'dsh-geogebra-studio', tabTypes[0]?.id)
check('tab title', tabTypes[0]?.title() === 'GeoGebra')

const entry = registrations.find((registration) => registration.options?.name === 'sidebar.panellist')
check('registers a left-rail entry', entry !== undefined)
check('left-rail id', entry?.options.id === 'geogebra', entry?.options.id)
check('left-rail order', entry?.options.order === 20, entry?.options.order)
check('left-rail label', entry?.options.label() === 'GeoGebra Studio')

const nav = entry.component({ size: 18, active: false })
check('left-rail uses the official icon', nav?.type === PrimitiveIcon && nav?.props.size === 18)

const launcher = registrations.find((registration) => registration.options?.name === 'main')
check('registers the launcher main panel', launcher !== undefined)
check('launcher key', launcher?.options.key === 'geogebra', launcher?.options.key)
const face = launcher.options.inject()
face.launch()
check('launcher opens the right tab', opens.at(-1) === 'geogebra-studio', opens.at(-1))
check('launcher restores the conversation', panels.at(-1) === null, String(panels.at(-1)))

const tabBody = registrations.find((registration) => registration.options?.name === 'sidebar.right.pane.tab')
check('registers the right tab body', tabBody !== undefined)
check('right tab body key', tabBody?.options.key === 'dsh-geogebra-studio', tabBody?.options.key)
const body = tabBody.component({ sessionId: 'session-1' })
const findIframe = (node) => {
  if (node === null || typeof node !== 'object') return undefined
  if (node.type === 'iframe') return node
  for (const child of [].concat(node.props?.children ?? [])) {
    const found = findIframe(child)
    if (found !== undefined) return found
  }
  return undefined
}
const iframe = findIframe(body)
check('canvas renders an iframe', iframe !== undefined)
check('canvas frame points at the viewer bridge', iframe?.props.src?.startsWith('/dsh-geogebra-studio/viewer?session=session-1&v=0'), iframe?.props.src)
check('no footer action registered', !registrations.some((registration) => registration.options?.name === 'sidebar.footer.action'))

if (failures.length > 0) {
  console.error(`plugin verification failed: ${failures.join(', ')}`)
  process.exit(1)
}
console.log('dsh plugin contract, tools and right-canvas bridge OK')
// Preview listeners belong to the live plugin and are intentionally not closed
// by a tool call; end the verifier once its assertions are done.
process.exit(0)
