/**
 * Remove iCloud Drive / File Provider conflict copies (for example
 * `viewer 2.js`) from this package before npm builds the tarball.
 *
 * The Documents file provider duplicates rebuilt files while the plugin
 * runtime is written. `.npmignore` does not reliably filter them out of the
 * `files` whitelist, so clean them immediately before packing.
 */
import { readdir, rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CONFLICT = / \d+(?:\.[^/\\]*)?$/

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue
    const target = join(directory, entry.name)
    if (entry.isDirectory()) {
      await walk(target)
      continue
    }
    if (CONFLICT.test(entry.name)) {
      await rm(target, { force: true })
      console.log(`removed conflict copy ${target.slice(ROOT.length + 1)}`)
    }
  }
}

await walk(ROOT)
