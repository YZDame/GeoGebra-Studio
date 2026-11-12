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
3. On success the right-side canvas reloads with the new construction. Do not call `geogebra_preview` for the right panel; it is only for a separate loopback link or a full browser tab. Tell the user the canvas was updated and keep the conversation going for follow-up edits.
4. Rendering needs network access to the official GeoGebra engine; generating the HTML does not. The plugin cannot watch the canvas. Wait for `window.geogebraStudio.status` in the opened page to become `ready` or `error`, and ask the user to confirm labels, branches, tangency, incidence, clipping, moving free points and light/dark contrast. A written file or reachable CDN is not proof of rendering. Report visual verification as not performed when you cannot inspect the page.

If the user has not opened the right canvas yet, mention the **GeoGebra Studio** entry in the left sidebar. The canvas shows the latest construction after it opens.

Read [visual standards](references/visual-standard.md) before choosing widths, colors, label placement and 2D/3D camera settings.

## Edit and export

Free points can be dragged in the right canvas. The canvas is the full viewer with its template header: the left button opens the objects/algebra sidebar, the theme and light/dark controls sit beside it, and the download menu offers GGB, HTML, PNG, SVG, PDF, XML and TikZ. User edits are not written back to the JSON or HTML on disk: **download current HTML or GGB before leaving.**

For source export, download the current XML, save it in the workspace, then call `geogebra_export` with `format` `tsqx` or `asymptote`. Strict export rejects unsupported relations instead of silently replacing them with fixed coordinates. TSQX output may contain injected Asymptote; do not call it pure TSQX.

TikZ is a static visual snapshot: download native GeoGebra PGF, save it in the workspace, and call `geogebra_export` with `format: "tikz"`. XML is not accepted for TikZ.

Read [exports](references/exports.md) for format limits and provenance. Read [showcase](references/showcase.md) for worked examples. Read [installation](references/installation.md) when the plugin, right canvas or runtime fails to load.
