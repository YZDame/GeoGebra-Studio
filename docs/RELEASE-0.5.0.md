# GeoGebra Studio v0.5.0 — Release notes

This version turns GeoGebra Studio into **one self-contained Agent Skill** with optional Codex Plugin packaging. It is a breaking migration away from the previous MCP interface.

## Highlights

- Install the `geogebra-studio` Skill directly from GitHub with a standard Agent Skills installer; no dedicated GeoGebra Studio npm runtime, MCP server, backend or database is required.
- Create local interactive, editable GeoGebra HTML through a bundled CLI. Inspect constructions in an agent browser pane or standard browser.
- Keep both 2D and 3D constructions, native Algebra View editing, themes, and seven Viewer downloads: GGB, HTML, PNG, SVG, PDF, XML and TikZ.
- Preserve accurate TikZ export using official GeoGebra PGF followed by bundled Gikz; retain standalone strict XML-to-Asymptote and mixed TSQX/Asymptote conversion.
- Place the Algebra View button on the left side of the header toolbar; keep themes and download controls on the right.
- Provide documentation in nine languages and browser-backed mathematical regression tests.

## Installation

**Agent Skills (recommended):**

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

**Codex Plugin** ([npm](https://www.npmjs.com/package/@lydt/geogebra-studio/v/0.5.0)):

```sh
npx @lydt/geogebra-studio@0.5.0 install
```

The Skill carries a prebuilt runtime and requires Node.js >=22.12. The exported HTML currently loads official GeoGebra engine assets from the network.

## Breaking changes and migration

The MCP server and its tools, MCP Apps, manifests and dependencies have been removed. Existing MCP clients must remain on **0.4.0**, or migrate to the Skill's local generate/export commands. Do not attempt to use `geogebra-mcp` with 0.5.0.

Manual edits in the browser are saved by downloading a **new current-state HTML or GGB**, not by modifying the original generated file. XML-to-TSQX/Asymptote support is limited to the validated semantic subset; unsupported construction relations cause an explicit strict export error.

## Validation

The v0.5.0 rearchitecture was verified with dependency-free Skill installation, npm package checks, Codex Skill discovery, real browser construction/edit/export/reopen tests, 2D/3D responsive layout, and mathematical regressions. See [GitHub Actions checks](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml) for the relevant commit.

## Publication

Publishing a GitHub Release with tag `v0.5.0` triggers `.github/workflows/publish-npm.yml` to build, verify and publish `@lydt/geogebra-studio@0.5.0` through npm trusted publishing. Configure the npm Trusted Publisher for GitHub owner `YZDame`, repository `GeoGebra-Studio`, workflow filename `publish-npm.yml`, and environment `npm` before publishing the Release. Published on 2026-10-29 as `@lydt/geogebra-studio@0.5.0` (dist-tag `latest`) with npm provenance.
