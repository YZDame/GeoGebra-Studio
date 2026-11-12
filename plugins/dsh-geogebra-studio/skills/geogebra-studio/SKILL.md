---
name: geogebra-studio
description: Create, inspect, edit, and export interactive 2D/3D GeoGebra constructions as local HTML, with TikZ, Asymptote and TSQX source workflows.
---

# GeoGebra Studio

This skill ships with the GeoGebra Studio plugin for DeepSeek Harness. The plugin provides three tools, so no separate Skill install, `npm install`, MCP server or Chrome setup is needed:

- `geogebra_build` — write a new editable GeoGebra HTML construction from a JSON spec.
- `geogebra_preview` — serve a generated HTML file on loopback and return its URL.
- `geogebra_export` — export strict semantic TSQX/Asymptote from GeoGebra XML, or clean native PGF into TikZ.

Use the official GeoGebra applet, not a screenshot or a hand-drawn approximation. The deliverable is a local editable HTML file that the user can keep editing.

## Construct

1. Read [construction guidance](references/construction.md). Translate the mathematical problem into dependency-preserving GeoGebra commands. Prefer dependent constructions over frozen coordinates.
2. Call `geogebra_build` with `workspace` set to the absolute project directory and a `spec` like:

   ```json
   {
     "filename": "diagram.html",
     "commands": ["A=(0,0)", "B=(4,0)", "c=Circle(A,B)"],
     "visibleLabels": ["A", "B"],
     "showAxes": true
   }
   ```

   The spec needs a new `filename` ending in `.html` and a nonempty `commands` array (or `ggbBase64`). Optional fields: `mode` (`"2D"` or `"3D"`), `view3D`, `labelOffsets`, `width`, `height`, `showAxes`, `visibleLabels`, `captionOverrides`, `title`. Files are never overwritten: choose a new filename instead of retrying an existing path.
3. Call `geogebra_preview` with the returned `htmlPath` and the same `workspace`. Put the returned URL first in your reply as **Open interactive preview**, then link the HTML file separately as a download. Keep the session running while the user views it.
4. Rendering needs network access to the official GeoGebra engine; generating the HTML does not. The plugin cannot watch the canvas. Wait for `window.geogebraStudio.status` to be `ready` or `error` in the opened page, and ask the user to confirm labels, branches, tangency, incidence, clipping, moving free points and light/dark contrast. A written file or reachable CDN is not proof of rendering. Report visual verification as not performed when you cannot inspect the page.

Read [visual standards](references/visual-standard.md) before choosing widths, colors, label placement and 2D/3D camera settings.

## Edit and export

Free points and the native object editor are available in the viewer. User edits are not written back to the JSON or HTML on disk: **download current HTML or GGB before leaving**. The viewer also downloads PNG, SVG, PDF, XML and cleaned TikZ.

For source export, download the current XML in the viewer, save it in the workspace, then call `geogebra_export` with `format` `tsqx` or `asymptote`. Strict export rejects unsupported relations instead of silently replacing them with fixed coordinates. TSQX output may contain injected Asymptote; do not call it pure TSQX.

TikZ is a static visual snapshot: download native GeoGebra PGF, save it in the workspace, and call `geogebra_export` with `format: "tikz"`. XML is not accepted for TikZ.

Read [exports](references/exports.md) for format limits and provenance. Read [showcase](references/showcase.md) for worked examples. Read [installation](references/installation.md) when the plugin or runtime fails to load.
