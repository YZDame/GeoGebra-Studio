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
4. After generation, start the bundled, single-document preview by default when the client can open a loopback URL. Keep the process running after you reply so the user can open the link:

   ```sh
   node "<SKILL_DIR>/scripts/geogebra-studio.cjs" preview --input "<ABS_HTML>" --workspace "<ABS_WORKSPACE>"
   ```

   Open the returned `http://127.0.0.1:<port>/viewer.html` in the client's browser sidebar or browser tab. The temporary Node.js process binds to loopback and serves only the selected HTML snapshot. If the client rejects access for security reasons, stop that attempt and report the restriction. Do not change transports or use another tool to work around the rejection.
5. Wait for `window.geogebraStudio.status` to become `ready` or `error`. Inspect the *actual* drawing: labels, branches, tangency, incidence, equal-axis scale, clipping, moving free points, and the native algebra sidebar. Check light and dark modes: keep a subtle outer canvas border matching the header buttons' `--line` theme color in both modes, and prevent a second applet frame. Distinguish an engine resource-loading error from a failed construction command, and use the failed command/index or browser logs for diagnosis. A successfully written HTML file, a reachable CDN from the terminal, or a passing external-browser check is not proof of rendering inside the intended agent client. Report when visual/browser verification was not possible.

6. In your reply, put the clickable loopback URL first as **Open interactive preview** (or its equivalent in the user's language) when the client can open it. Link to the generated HTML separately as a download. When loopback access is unavailable, give the HTML download and explain how to open it directly in Chrome, Safari, or another regular browser. Mention that both ways of viewing the HTML require the browser to reach the official GeoGebra engine online. Generating the HTML itself can be done offline.

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
