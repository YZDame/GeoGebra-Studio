---
name: geogebra-construct
description: Generate editable GeoGebra HTML and open it in the Codex browser panel, with no MCP server or separate Chrome installation.
---

Understand mathematical definitions, free inputs and dependent objects. Prefer
GeoGebra relations over frozen coordinates. Generate commands in dependency order.

For literal styles, the viewer routes `SetColor`, `SetLineThickness`,
`SetLineStyle` and `SetPointSize` through the native applet API. Prefer
`SetColor(a, "#AAB2BC")` or normalized RGB `SetColor(a, 0, 0.5, 1)`;
byte RGB triples are also accepted for compatibility. Named colors and
numeric expressions use the applet numeric evaluator. Common named colors are supported. Styles apply in command order
and are restored after viewer defaults, so explicit sizes and weights survive.
`ZoomIn(xmin, ymin, xmax, ymax)` uses the native view API and disables
automatic fitting. Bounds may be finite numeric expressions. `SetCoords`, `SetFixed`,
`SetVisibleInView` (view 1 or -1 for 3D), `SetValue` (numeric/boolean), `SetCaption`,
`ShowLabel` and common display setters use native API actions too.
GeoGebra's parser can return false for a successful scripting action because
it creates no new objects; never use that return value as a universal action
success check. Geometry commands use the parser, with async loading for unloaded-module errors.
Invalid inputs and missing action targets still stop with an indexed error.

## Default workflow

1. Write a construction JSON in the user's project with `commands`, `filename`
   (a new `.html` path relative to the project), and optionally `visibleLabels`,
   `captionOverrides`, `showAxes`. For Cartesian diagrams use `showAxes: true`.
   For solid geometry set `mode: "3D"`; leave the default `2D` for plane geometry.
2. Resolve the installed plugin root from this skill's location (`../..`). Run:
   `node <PLUGIN_ROOT>/dist/cli.js generate --input <ABSOLUTE_SPEC_JSON> --workspace <ABSOLUTE_USER_PROJECT>`.
   Quote every path. The generator needs Node >=22.12, no node_modules, MCP, or Chrome.
   Do not use an unversioned npx command to run unpublished local changes.
3. Open the returned HTML in the Codex right-side **browser panel**, not just the
   source editor. Use the available in-app browser/open-panel tools. If local file
   navigation is unsupported, serve the project on loopback, e.g.
   `python3 -m http.server 8765 --bind 127.0.0.1 --directory <USER_PROJECT>` and open
   `http://127.0.0.1:8765/<RELATIVE_HTML_PATH>` with proper URL encoding.
   Reuse a running server or select another port if occupied. Do not expose it publicly.
4. Wait for `window.geogebraStudio.status === 'ready'` or `'error'` using the
   available browser inspection tools. `window.ggbReady` and `window.ggbError`
   remain compatibility flags. A failed command reports its index and text;
   fix the JSON, generate a new filename (existing files are not overwritten),
   and reload the correct URL. Never claim engine validation from generation alone.
5. Inspect the rendered page for tangency, incidence, branch selection, equal-axis
   scale, clipping and labels. Verify dragging a free point and the object sidebar.
   Keep the live viewer visible as the main deliverable. No background screenshot
   is required. If browser inspection is unavailable, report that verification remains pending.

The viewer uses the official GeoGebra applet and needs internet access for engine
assets. Do not replace it with a custom-drawn approximation. Read
[visual standards](../../docs/VISUAL-STANDARD.md) for presentation and
[the tangent regression](../../docs/TANGENT-REGRESSION.md) for intersection branches.

## 3D presentation

Use the shared viewer, without editing generated HTML. See
[the cube example](../../examples/cube-3d.json). Small points (size 1), thin
edges (weight 1), native LaTeX labels and no explanation cards are the defaults.
Use weight 2 for a small number of highlighted lines. Keep fills faint and colors
restrained. Do not add titles, legends, formula panels or instructions over the
diagram unless the user requests them. Hide the coordinate plane/grid for solid
geometry; use `showAxes: true` only when coordinates are part of the explanation.

Optional `view3D` accepts `bounds: [xmin,xmax,ymin,ymax,zmin,zmax]` and a nonzero
`direction: [x,y,z]`. Otherwise the native view fits visible construction points.
Optional `labelOffsets` maps point names to `[dx,dy,dz]` offsets in world units;
use this to avoid label collisions in the chosen initial view. Labels use native
LaTeX Text with 3D anchors, including subscripts such as `A_1`. Check them after
rotation. The HTML theme and native 3D canvas must share the same background in
both light and dark modes. Reopened current-state HTML must keep its 3D mode,
camera, labels and object edits.

## Edits and exports

Dragging/editing changes the current applet, not the original JSON or disk file.
Use Download → current HTML or GGB to preserve changes before closing or refreshing.
Reopened downloaded HTML loads packed GGB instead of replaying the original commands.
For inspection, `await window.geogebraStudio.snapshot()` returns current `ggbBase64`,
`constructionXml` and checks; this is a page-local API, not a tool connection.
Do not regenerate from old commands when the user wants to keep manual edits.
Read geometry-export for current-state downloads and source export limitations.

## Optional automation

Only use `generate ... --verify` when background browser verification is requested
or necessary for batch/CI work. It opts into Chrome, packed-GGB round-trip checks
and a preview PNG. Prepare that runtime with `browser install` only when needed.
The legacy `mcp` command and tools remain available for explicit integrations;
normal construction does not require starting or registering them.
