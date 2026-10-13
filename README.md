# GeoGebra Studio

> Release status: `0.4.0-rc.2` is published on npm and passed anonymous public installation, fresh Codex-session MCP/artifact checks, and real-browser export checks on macOS with Chrome. Stable `0.4.0` awaits platform/CI checks. Use the pinned candidate below; see the [release record](docs/RELEASE-0.4.0-rc.2.md).

A local Codex plugin combining **MCP tools, agent skills, an editable GeoGebra HTML
viewer, and built-in Gikz**. Describe a geometry problem; get a local HTML carrying
a packed, editable GGB, then modify objects and download the current construction.

[中文](README.zh-CN.md) · [Visual standard](docs/VISUAL-STANDARD.md) · [Regression](docs/TANGENT-REGRESSION.md)

## Install the complete plugin

Requires Node >=22.12.0, npm/npx and a Codex installation supporting plugin commands.

```sh
npx @lydt/geogebra-studio@0.4.0-rc.2 install
```

Installation registers a persistent, version-pinned npm marketplace and installs
both skills and MCP through Codex. It probes existing Chrome; if none is usable,
it downloads managed Chromium. No GeoGebra desktop app or external Gikz is needed.
Start a **new Codex session**, invoke `@geogebra-studio`, and describe the problem.

```text
Draw Gamma: x²+y²=25 and omega: (x−3)²+y²=64/25. A moves on Gamma.
The two tangents from A to omega meet Gamma again at B and C.
Deliver an editable local HTML with labels O, I, A, B, C, Γ and ω.
```

The agent uses `geogebra_build_artifact`: execute native commands, check visible
objects, embed packed GGB, reopen the final viewer, check equal axes and return a
preview for visual review. Output files are new files within the workspace; existing
files are not overwritten. The example commands are in
[examples/tangent-construction.json](examples/tangent-construction.json).
The agent passes the absolute user project directory as `workspace` when saving;
clients can also supply MCP roots. Output is never silently directed into the plugin cache.

## Edit and download

Open the HTML in a browser, drag A, or expand the left object sidebar to change
original definitions/styles. Theme, light/dark and download buttons sit at the
upper right. Nine paired themes are included.

| Download | What it preserves |
| --- | --- |
| GGB | Native editable construction, relationships and styling |
| HTML | Packed GGB, interactive viewer, themes and local cleaner |
| XML | GeoGebra definitions and styles; not a packed GGB |
| SVG / PDF | Static vector rendering |
| PNG | Static raster rendering |
| TikZ (.tex) | Native PGF passed through Gikz; normalized static source |

**Every TikZ export uses native PGF → built-in Gikz → .tex.** This includes viewer
downloads, geogebra_export_tikz, geogebra_export_source(format=tikz), and the generic
exportPGF bridge. Failure is an error, with no raw fallback. Gikz normalizes colors,
widths, label placement and precision; construction dependencies remain in GGB/XML.
Asymptote and mixed TSQX/Asymptote retain the existing explicit semantic subset and
strict/partial warnings. General relation reconstruction still requires review.

## MCP-only and diagnostics

```sh
npx @lydt/geogebra-studio@0.4.0-rc.2 mcp          # MCP only; no-argument invocation also works
npx @lydt/geogebra-studio@0.4.0-rc.2 doctor       # Browser launch and built-in Gikz check
npx @lydt/geogebra-studio@0.4.0-rc.2 browser install
```

`mcp` alone does not install skills. PUPPETEER_EXECUTABLE_PATH selects a custom Chrome.
GEOGEBRA_STUDIO_HOME controls Studio's browser cache; CODEX_HOME controls Codex's
persistent catalog location. Never configure an ephemeral npx directory as a plugin.
The plugin's MCP configuration invokes the exact matching package version.

Native execution and opening the viewer require official GeoGebra network assets.
Generated HTML is a local file, not a fully offline GeoGebra distribution. Gikz
cleanup is local and makes no network request. Loading errors are shown explicitly.
The initial release targets local Codex, not a hosted ChatGPT endpoint/public listing.

## Develop and validate

```sh
npm ci --ignore-scripts
npm run build
npm run test:unit
npm run verify
npm run verify:native
```

Native/browser checks need Chrome and internet. `node scripts/verify-viewer.cjs`
checks responsive geometry, native sidebar editing and seven downloads;
`node scripts/verify-gikz-mcp.cjs` checks the actual MCP TikZ routes.
Build outputs and all licenses ship in npm and versioned plugin ZIP artifacts.
Published marketplace packages do not rely on install-time build/lifecycle scripts.
For unpublished authoring, `node dist/cli.js install --local` installs a stable local
copy; use a fresh CODEX_HOME to isolate a test installation. Source-build validation
and an SDK handshake alone do not establish real plugin loading in a fresh session.

## Migration and licensing

GeoGebra Studio succeeds @lydt/geogebra-mcp-server and plugin geogebra-geometry.
Existing geogebra_* tool names and the geogebra-mcp binary alias remain. Install the
new plugin, verify it in a new session, then remove the old one if desired; the
installer does not remove it automatically. GIKZ_CLI is no longer needed or used.
The GitHub repository URL remains valid under its original name until its owner
renames it; package branding does not require an immediate repository rename.

The combined distribution is GPL-2.0-or-later. Original MCP portions retain their
MIT notices in LICENSE-MIT; Gikz's upstream attribution and source are in gikz/.
Clipper-derived palettes retain their MIT notices in THIRD_PARTY_NOTICES.md.
This plugin is independently maintained and is not an official GeoGebra product.
