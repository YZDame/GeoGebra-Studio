/**
 * Asset resolver substituted for `src/export/runtime-assets.ts` when bundling
 * the plugin runtime. The bundled viewer, Gikz script and license live beside
 * `runtime/geogebra.mjs`, so paths resolve from `import.meta.url` instead of
 * the root checkout's `dist/` directory.
 */
import { fileURLToPath } from 'node:url'

const RUNTIME_DIR = new URL('./', import.meta.url)

/** Resolve one bundled asset that sits beside the runtime module. */
export function runtimeAsset(name) {
  return fileURLToPath(new URL(name, RUNTIME_DIR))
}

/** Path to the bundled Gikz license text. */
export function gikzLicensePath() {
  return fileURLToPath(new URL('gikz-license.txt', RUNTIME_DIR))
}
