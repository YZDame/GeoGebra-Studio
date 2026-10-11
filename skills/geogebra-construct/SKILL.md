---
name: geogebra-construct
description: Construct editable GeoGebra geometry from a mathematical problem and deliver interactive HTML or a packed GGB file.
---

Use `geogebra_create_html` when the user wants a downloadable interactive page.
It generates the page without launching Chromium; the recipient's browser loads
GeoGebra from its network assets. Supply a command array in dependency order.
The page downloads the current, edited applet state as GGB, PNG, SVG, PDF, XML,
or another HTML. Generation alone does not verify the rendering.

Use the server-side tools when actual exported files are needed immediately:
clear the construction, execute a command batch, inspect objects and definitions,
then export. All calls share one construction; keep a diagram's operations together.
Do not mix unrelated diagrams in the same live engine.

For advanced API tasks, call `geogebra_api_list_methods` to inspect methods exposed
by the running GeoGebra version, then use `geogebra_api_call` with JSON arguments.
Prefer focused construction/export tools for routine work. Callback-based exports
can be awaited with `waitForCallbackIndex`; JavaScript event listeners need a real
callback ID marker (`{"$ggbCallbackId":"listener-1"}`) and events can be read with
`geogebra_api_get_callback_events`. Methods that
replace or clear construction data require `allowDestructive: true`.

Prefer constructions expressing relations: `M=Midpoint(A,B)`, `c=Circle(A,B,C)`,
`H=Intersect(l,m)`. Keep free coordinates only for unconstrained inputs. GeoGebra's
three-point circle command is `Circle(A,B,C)`. For LaTeX text objects use the fourth
Boolean: `Text("A", A+(-0.3,-0.3), true, true)`.

The existing GGB export defaults retain LaTeX captions and small point/line sizes.
Use `visibleLabels` to match the problem's named objects. Avoid exposing automatic
segment and circle labels unless requested. Inspect the rendered result for label
collisions, clipping, and equal axis scaling. Reopen the packed GGB to verify
editability when delivery requires it; XML is not a packed GGB.

For editable publication source, use `geogebra_get_semantic_scene` and
`geogebra_export_source`. Read the packaged `geometry-export` skill when a
conversion reports unsupported relations or coordinate fallbacks.
