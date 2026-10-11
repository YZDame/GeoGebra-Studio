---
name: geometry-export
description: Export GeoGebra diagrams to editable TikZ, Asymptote, or TSQX, preserving construction relations and reconstructing unsupported definitions with AI assistance.
---

Start from `geogebra_get_semantic_scene`. Retain its original XML, command inputs
and outputs, captions, styles, visibility, and resolved coordinates. A screenshot
provides appearance evidence; the XML provides definitions. Use both when available.

Try `geogebra_export_source` with the requested format and `strict=true`. Its
implemented subset covers free finite points, two-point midpoints, segments,
polygons, and circles through a center and point or through three points.
The result's `complete` describes that subset's geometry conversion; it does not
prove identical layout. Inspect all warnings, including normalized dashes, marker
styles, label placement, non-point labels, and omitted circle fill.

For unsupported definitions, get a `strict=false` draft and use the original XML
to rebuild relations in the target language. Resolve dependencies before their
outputs; retain intersection branch choices, tangency conditions, constrained
points, orientation, and hidden helper objects. Do not substitute the current
coordinates for a constrained point without identifying that loss. Keep a short
mapping from each source object to its target definition and any unresolved choice.

TikZ's calc/intersections libraries can preserve basic affine and line relations.
Asymptote's geometry module can represent constructions and intersections.
TSQX handles native point definitions and common geometry expressions; use `!`
Asymptote lines for operations or appearance it cannot express directly. Call such
output **mixed TSQX/Asymptote** and keep one labeling mechanism. Do not label it pure
TSQX when most geometry is injected Asymptote.

For an existing noisy GeoGebra TikZ export, `geogebra_clean_tikz` invokes an external
Gikz installation configured with `GIKZ_CLI`. Gikz also accepts XML. Its coordinate
cleanup does not establish preserved construction dependencies. Preserve its
separate upstream licensing; do not copy its implementation into this plugin.

If the target toolchain exists, compile the source and inspect the rendered figure.
Check mathematical relations separately from layout: equal-axis scale, branch
choices, point incidence, clipped curves, label positions, and visibility. Deliver
editable source, rendered output when requested, and specific unresolved warnings.
Do not claim verification for a toolchain or host that was not exercised.
