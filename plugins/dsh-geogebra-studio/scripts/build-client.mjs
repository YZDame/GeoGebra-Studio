/**
 * Bundle src/client.jsx into the CJS module the DeepSeek Harness web shell
 * loads. React and @deepseek-ai/* stay external: the shell provides them.
 * Output: lib/client.js, wrapped for window.__ModuleLoader__.
 */

import { build } from 'esbuild'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const entry = join(root, 'src/client.jsx')
const outDir = join(root, 'lib')
const tmpDir = join(outDir, '.tmp')
const tmpFile = join(tmpDir, 'client.cjs')
const outFile = join(outDir, 'client.js')
const pluginId = 'dsh-geogebra-studio'

const externals = [
  'react',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/*',
]

await mkdir(tmpDir, { recursive: true })

try {
  await build({
    entryPoints: [entry],
    bundle: true,
    format: 'cjs',
    platform: 'browser',
    target: 'es2022',
    jsx: 'automatic',
    jsxImportSource: 'react',
    external: externals,
    outfile: tmpFile,
    sourcemap: false,
    minify: false,
    logLevel: 'warning',
  })

  const cjs = await readFile(tmpFile, 'utf8')
  const wrapped = [
    'window.__ModuleLoader__.load({',
    ` id: "${pluginId}",`,
    ' factory: (require) => {',
    ' var module = { exports: {} };',
    ' var exports = module.exports;',
    cjs.replace(/\n$/, ''),
    ' return module.exports;',
    ' }',
    '});',
    '',
  ].join('\n')

  await mkdir(outDir, { recursive: true })
  await writeFile(outFile, wrapped, 'utf8')
  console.log(`client bundle written: ${outFile} (${String(wrapped.length)} bytes)`)
} finally {
  await rm(tmpDir, { recursive: true, force: true })
}
