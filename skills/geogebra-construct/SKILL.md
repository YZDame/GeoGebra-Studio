---
name: geogebra-construct
description: Build editable GeoGebra geometry from a problem, delivering a checked local HTML with embedded GGB, a preview, and current-state downloads.
---

Understand the user's mathematical definitions, free inputs, dependent objects and
requested deliverables. Ask only when ambiguity changes the construction. Prefer
GeoGebra relations over frozen coordinates for constrained points and intersections.

Default to `geogebra_build_artifact`: supply commands in dependency order,
`visibleLabels`, `captionOverrides` where useful, and a new workspace `.html` filename.
For every diagram defined or interpreted in Cartesian coordinates, pass `showAxes: true`
so both x- and y-axes are visible. This coordinate-diagram rule overrides the general
axes-hidden visual default; non-coordinate geometry may keep axes hidden. Inspect the
preview to confirm the axes are actually visible and the plotted objects fit the view.
Always pass `workspace` as the absolute path of the user's current project directory
when saving files. Codex starts the plugin in its cache directory; that directory
must not become the output destination. MCP roots are used when provided by a client.
This tool uses an isolated native engine, packs a real GGB, reopens the final viewer,
checks equal axes and returns a preview. Inspect that preview before claiming visual
quality; engineVerified and packedGgbVerified are separate from renderVerified.
Do not call geogebra_clear_construction for this isolated workflow.

Read [visual standards](../../docs/VISUAL-STANDARD.md) when adjusting presentation.
For tangents/intersections, read [the two-circle regression](../../docs/TANGENT-REGRESSION.md)
to avoid selecting A again when intersection branches swap. The case is a regression,
not a requirement to use that construction or sample coordinates for other problems.

Deliver the local HTML path and describe how to open the object sidebar, drag free
points and download the current state. The viewer uses the official GeoGebra engine;
do not replace it with a custom-drawn canvas/SVG or a desktop GeoGebra workflow.
It requires internet for official GeoGebra assets; Gikz cleanup runs locally.

`geogebra_create_html` is a lightweight command-template alternative when explicitly
appropriate. It does not execute/check commands or embed a prebuilt GGB by default;
never describe template generation alone as verified geometry.

For advanced server-side work, the older focused tools share one construction:
keep each diagram's calls together. Use geogebra_api_list_methods before unfamiliar
API calls; persistent callbacks use $ggbCallbackId and event polling. Prefer focused
tools for routine construction and export.

For source export, read geometry-export. Every TikZ export uses native PGF followed
by built-in Gikz; no raw fallback. Retain GGB/XML for construction dependencies.
