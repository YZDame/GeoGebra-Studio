---
name: geometry-export
description: Export GeoGebra geometry to GGB, vector/image formats, cleaned TikZ, Asymptote or mixed TSQX/Asymptote, with explicit construction-provenance limits.
---

The default HTML viewer downloads the current edited applet as GGB, PNG, SVG,
TikZ (.tex), PDF, XML or another self-contained viewer HTML. Use native GGB/XML
when users need editable construction definitions; decode GGB base64 into ZIP bytes.
When a tool saves a file, pass `workspace` as the absolute user project directory,
with `filename` relative to that directory. Never save into the installed plugin cache.

Every TikZ path MUST use GeoGebra native PGF followed by built-in Gikz. Use
geogebra_export_tikz or geogebra_export_source(format=tikz); the generic exportPGF
bridge and viewer download follow the same policy. A cleaner failure is an error,
never an excuse to return raw PGF. Gikz is included; do not install an external CLI.
Its cleaning normalizes precision, colors, widths and labels. TikZ is a static
visual snapshot, not a guaranteed dependency-preserving replacement for GGB.
Use geogebra_clean_tikz for existing native PGF or explicit XML conversion.

For Asymptote/TSQX, start from geogebra_get_semantic_scene and retain original XML,
commands, captions, styles and coordinates. geogebra_export_source strict=true
supports independent finite points, midpoints, segments, polygons and basic circles.
Inspect all warnings. strict=false yields an explicit partial draft. Reconstruct
unsupported relations using the XML; do not silently freeze dependent points.
TSQX with injected Asymptote is mixed TSQX/Asymptote, not pure TSQX.

Compile source when a toolchain is available/requested and inspect the figure.
For an open .tex editor, edit that file in place and use its built-in compiler.
Check point incidence, tangency, equal-axis scale, clipping, branches and labels.
Report actual checks and remaining limitations; successful compilation is not proof
of mathematical or visual correctness. See [regression](../../docs/TANGENT-REGRESSION.md).
