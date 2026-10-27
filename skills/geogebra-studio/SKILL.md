---
name: geogebra-studio
description: Create, inspect, edit, and export interactive 2D/3D GeoGebra constructions as local HTML, with TikZ, Asymptote and TSQX source workflows.
---

# GeoGebra Studio

Use the official GeoGebra applet, not a screenshot or a hand-drawn approximation. The deliverable is a local editable HTML file. No MCP server or independent browser automation is required for the default workflow.

## Construct and inspect

1. Read [construction guidance](references/construction.md). Translate the mathematical problem into dependency-preserving GeoGebra commands. Prefer dependent constructions to frozen coordinates.
2. Write a JSON specification in the user's workspace with a new `filename` ending in `.html`, a nonempty `commands` array, and optional `visibleLabels`, `showAxes`, `captionOverrides`, `mode`, `view3D`, and `labelOffsets`.
3. Locate this skill folder from the location of this SKILL.md and run, with quoted absolute paths:

   ```sh
   node "<SKILL_DIR>/scripts/geogebra-studio.cjs" generate --input "<ABS_SPEC_JSON>" --workspace "<ABS_WORKSPACE>"
   ```

   The packaged runtime travels with the skill. Node.js >=22.12 is required; there is no extra `npm install`, MCP registration, or Chrome setup.
4. Open the returned HTML in the client's browser pane if available, otherwise in a regular modern browser. If local file URLs are not supported, serve the user workspace on loopback (for example `python3 -m http.server 8765 --bind 127.0.0.1 --directory "<ABS_WORKSPACE>"`) and open the corresponding localhost URL. Never publish the local server to the network.
5. Wait for `window.geogebraStudio.status` to become `ready` or `error`. Inspect the *actual* drawing: labels, branches, tangency, incidence, equal-axis scale, clipping, moving free points, and the native algebra sidebar. A successfully written HTML file is not proof of a correct diagram. Report when visual/browser verification was not possible.

The viewer loads official GeoGebra engine assets over the internet. Do not claim offline support.

## Export and edits

Read [exports](references/exports.md) for formats and provenance limits. The built-in viewer downloads current edited GGB, HTML, PNG, SVG, PDF, XML and cleaned TikZ. User edits do not modify the original JSON or HTML on disk; **download current HTML or GGB before leaving**.

For TSQX/Asymptote, download current XML or obtain it from `await window.geogebraStudio.snapshot()`, save XML in the workspace, and run:

```sh
node "<SKILL_DIR>/scripts/geogebra-studio.cjs" export --input "<ABS_XML>" --format tsqx --workspace "<ABS_WORKSPACE>" --output "construction.tsqx"
node "<SKILL_DIR>/scripts/geogebra-studio.cjs" export --input "<ABS_XML>" --format asymptote --workspace "<ABS_WORKSPACE>" --output "construction.asy"
```

Strict export rejects unsupported relations instead of silently replacing them with fixed coordinates. TSQX output may contain injected Asymptote; do not call it pure TSQX. TikZ visual export uses native GeoGebra PGF then bundled Gikz, not the semantic XML reconstruction.

## Optional and compatibility

Read [visual standards](references/visual-standard.md) for 2D/3D style rules, and [install/diagnostics](references/installation.md) when setup fails. Codex plugin installation is optional; this standalone skill works wherever an agent can read skill resources, run Node.js and open a browser. No MCP interface is shipped.
