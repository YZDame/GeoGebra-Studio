/**
 * Build the self-contained runtime consumed by the DeepSeek Harness plugin.
 *
 * Inputs: the root `dist/` bundle produced earlier in `npm run build`, the
 * shared Skill references, and the repository examples. Outputs live inside
 * `plugins/dsh-geogebra-studio/` so the plugin directory can be installed on
 * its own, from a checkout or from GitHub, without the rest of the repository.
 */
const fs = require('node:fs/promises');
const path = require('node:path');
const { build } = require('esbuild');

const ROOT = path.resolve(__dirname, '..');
const PLUGIN = path.join(ROOT, 'plugins', 'dsh-geogebra-studio');
const RUNTIME = path.join(PLUGIN, 'runtime');
const SKILL = path.join(PLUGIN, 'skills', 'geogebra-studio');
const SHARED_SKILL = path.join(ROOT, 'skills', 'geogebra-studio');

async function main() {
  await fs.rm(RUNTIME, { recursive: true, force: true });
  await fs.mkdir(RUNTIME, { recursive: true });

  await build({
    entryPoints: [path.join(PLUGIN, 'src', 'runtime-entry.js')],
    outfile: path.join(RUNTIME, 'geogebra.mjs'),
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node22',
    legalComments: 'inline',
    logLevel: 'warning',
    plugins: [{
      name: 'dsh-runtime-assets',
      setup(build) {
        build.onResolve({ filter: /runtime-assets(?:\.ts)?$/ }, () => ({
          path: path.join(PLUGIN, 'src', 'runtime-assets.js'),
        }));
      },
    }],
  });

  for (const [from, to] of [
    [path.join(ROOT, 'dist', 'viewer.js'), path.join(RUNTIME, 'viewer.js')],
    [path.join(ROOT, 'dist', 'gikz-browser.js'), path.join(RUNTIME, 'gikz-browser.js')],
    [path.join(ROOT, 'gikz', 'LICENSE'), path.join(RUNTIME, 'gikz-license.txt')],
  ]) {
    await fs.copyFile(from, to);
  }

  // Shared references and samples keep one source of truth with the standalone
  // Skill; the localized plugin skill body is authored here.
  await fs.mkdir(path.join(SKILL, 'references'), { recursive: true });
  await fs.mkdir(path.join(SKILL, 'examples'), { recursive: true });
  for (const name of ['construction.md', 'exports.md', 'visual-standard.md', 'showcase.md']) {
    await fs.copyFile(
      path.join(SHARED_SKILL, 'references', name),
      path.join(SKILL, 'references', name),
    );
  }
  for (const name of await fs.readdir(path.join(SHARED_SKILL, 'examples'))) {
    if (!name.endsWith('.json')) continue;
    await fs.copyFile(
      path.join(SHARED_SKILL, 'examples', name),
      path.join(SKILL, 'examples', name),
    );
  }

  const bytes = (await fs.stat(path.join(RUNTIME, 'geogebra.mjs'))).size;
  console.log(`dsh plugin runtime: ${path.relative(ROOT, RUNTIME)} (${bytes} bytes)`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
