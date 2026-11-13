/**
 * Remove iCloud Drive / File Provider conflict copies from generated build
 * outputs (for example `dist/viewer 2.js` or `cli.d 2.ts`).
 *
 * The Documents file provider duplicates files it saw change while a build was
 * writing them. `.gitignore` keeps them out of commits, but npm's `files`
 * whitelist would otherwise pack them, so they are filtered in package.json and
 * removed from the tree here.
 *
 * Usage:
 *   node scripts/clean-conflict-copies.cjs           remove every copy
 *   node scripts/clean-conflict-copies.cjs --check   exit 1 if any copy remains
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
// Generated directories only: `output/` and `outputs/` hold browser profiles
// and investigation artifacts that are not part of any package.
const TARGETS = [
  'dist',
  'skills/geogebra-studio/runtime',
  'plugins/dsh-geogebra-studio/runtime',
];
const CONFLICT = / \d+(?:\.[^/\\]*)?$/;
const checkOnly = process.argv.includes('--check');

function walk(directory, found) {
  let entries;
  try {
    entries = fs.readdirSync(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(target, found);
      continue;
    }
    if (CONFLICT.test(entry.name)) found.push(target);
  }
}

const found = [];
for (const target of TARGETS) walk(path.join(ROOT, target), found);

if (checkOnly) {
  if (found.length > 0) {
    console.error(`conflict copies in build outputs: ${found.length}`);
    for (const file of found.slice(0, 20)) console.error('  ' + path.relative(ROOT, file));
    process.exitCode = 1;
  } else {
    console.log('conflict copies in build outputs: 0');
  }
} else {
  for (const file of found) {
    fs.rmSync(file, { force: true });
    console.log(`removed conflict copy ${path.relative(ROOT, file)}`);
  }
  console.log(`removed conflict copies: ${found.length}`);
}
