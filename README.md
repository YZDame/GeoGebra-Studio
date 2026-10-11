# GeoGebra MCP + geometry skills

An MCP server and local plugin for editable GeoGebra constructions, interactive
HTML, native file exports, and publication source with construction provenance.

[中文说明](README.zh-CN.md) · [Architecture and protocol audit](docs/MODERNIZATION.md)

## Quick start

Requires **Node >=22.12.0**. From this checkout:

```sh
npm ci
npm run build
node dist/cli.js
```

For server-side rendering, install Chromium with `npx puppeteer browsers install chrome`,
or set `PUPPETEER_EXECUTABLE_PATH` to an installed Chrome executable.
HTML generation itself does not launch a browser; opening the generated page
requires internet access to GeoGebra's assets.

Configure an MCP client:

```json
{
  "mcpServers": {
    "geogebra": {
      "command": "node",
      "args": ["/absolute/path/to/geogebra-mcp-server/dist/cli.js"],
      "env": { "GEOGEBRA_TOOL_PROFILE": "core" }
    }
  }
}
```

The core profile exposes 19 construction, inspection, export, and Apps API tools. Omit
`GEOGEBRA_TOOL_PROFILE` to expose all 53 tools, including the original educational,
CAS, animation, and performance tools. Existing names and text payloads are retained;
object results also expose `structuredContent`.

The Apps API bridge adds `geogebra_api_list_methods` and `geogebra_api_call` for
public methods exposed by the running applet version. It complements the focused
tools rather than replacing them. One-shot callback exports can be awaited, and
persistent listeners can queue events under a callback ID for later retrieval. API
availability varies by GeoGebra app/version, so inspect the live method list first.
Construction replacement methods require an explicit `allowDestructive: true`.
This bridge controls the MCP server's applet; it does not reach into an unrelated
browser tab. Browser-only API arguments may still need dedicated wrappers. See
[the API bridge notes](docs/APPS-API-BRIDGE.md).

## Choose a workflow

### Interactive HTML without a server-side browser

Call `geogebra_create_html` with the arguments in [examples/triangle.json](examples/triangle.json).

For a ready-to-open, draggable geometry example with compact Chinese controls and combined export selection, see [圆与切线](examples/circle-tangency.html) and its construction data in [circle-tangency.json](examples/circle-tangency.json). The page loads GeoGebra Classic from geogebra.org, so an internet connection is required.
The returned HTML renders a Classic applet with LaTeX point labels and small,
black point/line styling. Its buttons download the **current edited state** as
GGB, PNG, SVG, PDF, XML, or HTML. Optional `filename` writes a new workspace file.
Generated HTML is not an offline GeoGebra distribution.

To package an existing live construction and its styles, call `geogebra_export_html`.

### Direct native files

1. `geogebra_clear_construction`
2. `geogebra_eval_commands` with a dependency-ordered command batch
3. Inspect with `geogebra_get_objects`; fit with `geogebra_auto_zoom` if needed
4. `geogebra_export_ggb`, `geogebra_export_png`, `geogebra_export_svg`, or `geogebra_export_pdf`

GGB uses the official asynchronous `getBase64(callback)` and is a real ZIP archive.
SVG and PDF use native GeoGebra callbacks for the graphics view. XML is retained
for provenance and is not renamed to GGB. GGB label controls (`labelMode`,
`visibleLabels`) and original point/line defaults remain available.

All server-side tools share **one construction per process**. Operations are queued,
but separate diagrams must still be kept together by the client. This is a local,
single-user server, not an isolated multi-tenant service.

### Editable TikZ, Asymptote, and TSQX

`geogebra_get_semantic_scene` returns original XML, command inputs/outputs,
coordinates, visibility, captions, and styles. Pass `xml` to inspect an existing
XML export without launching GeoGebra.

Call `geogebra_export_source` with `format: "tikz"`, `"asymptote"`, or `"tsqx"`.
It preserves an explicit subset: finite independent points, two-point midpoints,
segments, polygons, and center-point or three-point circles. Dependencies remain
expressions, rather than turning every derived point into a coordinate literal.

- `strict: true` (default) refuses unsupported definitions or coordinate freezing.
- `strict: false` produces a partial draft with `coordinateFallbacks`,
  `unsupportedObjects`, and warnings.
- `standalone: false` returns a TikZ fragment; default is a complete LaTeX document
  using the `calc` library.
- TSQX output is **mixed TSQX/Asymptote**, with native point definitions and explicit
  Asymptote drawing/style operations.

`complete` concerns the supported geometry subset. Label placement, dash patterns,
marker styles, non-point labels, and circle fills have documented presentation
limits. Read warnings and inspect the result. General conics, loci, arbitrary
functions, constrained points, and intersection branches need additional backends
or the packaged `geometry-export` skill's AI-assisted reconstruction workflow.

### Optional Gikz integration

Gikz remains a separately installed GPL CLI. No Gikz implementation is vendored.
Set `GIKZ_CLI` to its absolute `gikz.js` path in the MCP server environment:

```json
{ "GIKZ_CLI": "/absolute/path/to/Gikz/gikz.js" }
```

`geogebra_clean_tikz` accepts native TikZ text or GeoGebra XML in `source`, plus
Gikz's `standalone`, `points`, `labels`, and `round` options. Cleanup is not a promise
of preserved geometric dependencies. For a saved GGB, load it with
`geogebra_load_ggb`, retrieve its XML, then use this tool, or use Gikz's own file CLI.
The integration was checked against Gikz revision
`390460600c5ad4b20e3af8912dfe6a412de7ac1b`.

New HTML/source/cleaned-text exports only create new files inside the workspace;
existing files and symlink destinations are rejected. Existing native export
options retain their previous behavior.

## Plugin and MCP Apps UI

This root is a portable Agent Plugins package: `plugin.json`, `mcp.json`, and
three skills (`geogebra-setup`, `geogebra-construct`, `geometry-export`).
`.codex-plugin/plugin.json` and `.mcp.json` provide Codex compatibility.
Build and install dependencies in the checkout before connecting its local MCP.
Plugin-relative `cwd` runs the CLI from this root; clients that do not support that
resolution should use the absolute CLI configuration above.

HTML tools link to the standard MCP Apps resource `ui://geogebra/preview.html`
using `_meta.ui.resourceUri`. The bundled view uses the official MCP Apps bridge,
with GeoGebra network domains declared in its resource CSP. Hosts without MCP Apps
support can use the HTML returned by the tool. In-host ChatGPT installation and
sandbox permissions still require verification; browser HTML verification alone
does not establish ChatGPT compatibility.

## Protocol and remote deployment

The official TypeScript MCP SDK handles stdio framing, initialization, negotiation,
and Streamable HTTP. SDK 1.32.1 supports through **2025-11-25**. The latest published
specification found during this audit is **2026-07-28**, which introduces a stateless
request/discovery model. This project does not claim that newer revision's
conformance; see the [migration boundary](docs/MODERNIZATION.md#protocol-version-boundary).

```sh
node dist/cli.js --port 8787
# http://127.0.0.1:8787/mcp
```

HTTP is loopback-only with Host/Origin checks and no protocol session IDs.
Public OpenAI connections require a deployed HTTPS endpoint, appropriate
authentication, per-user construction/workspace isolation, and host testing.
Local plugin packaging does not publish an app, npm release, or directory listing.

## Verification

```sh
npm run verify
npx jest --runInBand tests/server.test.ts tests/unit/semantic-export.test.ts
# Real browser/network required:
npm run verify:native
node scripts/verify-html.cjs
# Optional external Gikz:
GIKZ_CLI=/absolute/path/to/Gikz/gikz.js node scripts/verify-exports.cjs
```

The scripts write artifacts under ignored `output/verification/`. Optional
`pdflatex`, `asy`, and `tsqx` can compile the generated source independently.
See [validation evidence](docs/VALIDATION.md) for the exercised paths and limits.

## Origin and license

Independently maintained fork of [efebausal/gebrai](https://github.com/efebausal/gebrai),
retaining MIT licensing and upstream attribution. Gikz derives from
[GGB-Tikz-Code-Filter](https://github.com/By990920/GGB-Tikz-Code-Filter) and is GPL;
keep its license and notices with that separate installation.
