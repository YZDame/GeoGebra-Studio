/**
 * Check the DeepSeek Harness plugin contract without a running dsh web session.
 * Confirms the host entry, the bundle patch, and that the client factory
 * registers sidebar.footer.action.
 */

import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
const patch = await readFile(join(root, 'cordis.patch.yml'), 'utf8')
const bundle = await readFile(join(root, 'lib/client.js'), 'utf8')
const host = await import(join(root, 'lib/index.js'))

const failures = []
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${detail === '' ? '' : ` — ${detail}`}`)
  if (!ok) failures.push(label)
}

check('package name', pkg.name === 'dsh-geogebra-studio', pkg.name)
check('GPL-2.0-or-later', pkg.license === 'GPL-2.0-or-later', pkg.license)
check('bundle patch path', pkg.dsh?.bundle?.patch === './cordis.patch.yml')
check('client export', pkg.exports?.['./client'] === './lib/client.js')
check('client platform web', pkg.dsh?.client?.platform === 'web')
check('client injects the sidebar package', pkg.dsh?.client?.inject?.includes('@deepseek-ai/dsh-client-ui-sidebar') === true)
check('patch inserts this plugin', patch.includes('id: dsh-geogebra-studio') && patch.includes('name: dsh-geogebra-studio'))
check('host name', host.name === 'dsh-geogebra-studio', String(host.name))
check('host apply', typeof host.apply === 'function')
check('host inject is an array', Array.isArray(host.inject))

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
const unexpected = unique.filter((spec) => !allowed.some((pattern) => pattern.test(spec)))
check('requires stay on the shell module table', unexpected.length === 0, unexpected.join(', '))

const registrations = []
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

const dictionaries = []
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
console.log('dsh plugin contract OK')
