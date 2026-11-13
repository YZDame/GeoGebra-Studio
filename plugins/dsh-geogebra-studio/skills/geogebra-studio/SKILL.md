---
name: geogebra-studio
description: Create, inspect, edit, and export interactive 2D/3D GeoGebra constructions as local HTML, with TikZ, Asymptote and TSQX source workflows.
---

# GeoGebra Studio

This skill ships with the GeoGebra Studio plugin for DeepSeek Harness. The plugin adds a **GeoGebra Studio** entry to the left sidebar (beside Plugins, Automation and Tasks). Selecting it opens a live GeoGebra canvas in the **right sidebar** while the conversation stays open. The canvas starts blank and updates automatically whenever `geogebra_build` succeeds.

## Construct in the right canvas

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
3. On success the right-side canvas reloads with the new construction. Call `geogebra_status` to read what that canvas rendered: status, failed command, undefined visible objects, equal-axis check and warnings. Use its optional `waitMs` (up to 15000) instead of polling yourself. Do not call `geogebra_preview` for the right panel; it is only for a separate loopback link or a full browser tab. Do not start Chrome or a headless browser to check a build: the canvas already runs the official engine, and a background browser only adds minutes.
4. Rendering needs network access to the official GeoGebra engine; generating the HTML does not. `geogebra_status` covers command execution and object checks but not aesthetics, so inspect the canvas or ask the user once about labels, tangency, clipping and light/dark contrast. Do not open the saved HTML in the client's own file preview: those panes usually sandbox scripts, so the figure and its buttons stay dead. The canvas is the viewer; the saved HTML is for a real browser or download.

If the user has not opened the right canvas yet, mention the **GeoGebra Studio** entry in the left sidebar. The canvas shows the latest construction after it opens, and only then can `geogebra_status` report it (otherwise it returns `pending`).

Read [visual standards](references/visual-standard.md) before choosing widths, colors, label placement and 2D/3D camera settings.

## Edit and export

Free points can be dragged in the right canvas. The canvas is the full viewer with its template header: the left button opens the objects/algebra sidebar, the theme and light/dark controls sit beside it, and the download menu offers GGB, HTML, PNG, SVG, PDF, XML and TikZ. User edits are not written back to the JSON or HTML on disk: **download current HTML or GGB before leaving.**

For source export, download the current XML, save it in the workspace, then call `geogebra_export` with `format` `tsqx` or `asymptote`. Strict export rejects unsupported relations instead of silently replacing them with fixed coordinates. TSQX output may contain injected Asymptote; do not call it pure TSQX.

TikZ is a static visual snapshot: download native GeoGebra PGF, save it in the workspace, and call `geogebra_export` with `format: "tikz"`. XML is not accepted for TikZ.

Read [exports](references/exports.md) for format limits and provenance. Read [showcase](references/showcase.md) for worked examples. Read [installation](references/installation.md) when the plugin, right canvas or runtime fails to load.
