# Command execution and regression checks

GeoGebra's `evalCommand()` returns whether evaluation produced object labels.
Scripting actions such as `SetCoords` and `ZoomIn` may change the construction
successfully while returning `false`. Stopping the viewer on every false return
therefore hides valid diagrams behind an error screen.

The viewer dispatches supported styles, viewport changes and object actions to
native applet setters with checked targets and arguments. Geometry expressions
use `evalCommand`, with asynchronous evaluation only for explicit unloaded-module
exceptions. Missing
targets, invalid numeric values and failed geometry commands remain errors; they
are not silently skipped. Native setter actions run once in command order.

Explicit point sizes and line weights survive viewer defaults. Explicit colors
survive initial theming and theme switches. Invisible objects do not acquire
visible helper labels. Four-bound ZoomIn uses command order
`xmin,ymin,xmax,ymax`, mapped to API order `xmin,xmax,ymin,ymax`; equal-axis
layout can expand the specified rectangle to fit the browser aspect ratio.

Run `npm run build`, `npm run test:unit`, and then
`node scripts/verify-command-runtime.cjs` for real-browser checks. The latter
requires a usable Chrome and access to GeoGebra's official engine assets. It
checks the reported coordinates, the tangent example, and the local Desargues
fixture when available; native image/document exports; and invalid-command
failures. Output goes to `output/verification/commands`.

Old HTML embeds the viewer at generation time. Updating the plugin changes newly
generated HTML; existing files must be regenerated from their construction data.
Packed GGB preserves manually edited state. Do not replace it with old commands.

GeoGebra implementation references:
- [GgbAPI.evalCommand and evalCommandGetLabels](https://github.com/geogebra/geogebra/blob/main/source/shared/common/src/main/java/org/geogebra/common/plugin/GgbAPI.java)
- [Async command module loader](https://github.com/geogebra/geogebra/blob/main/source/web/web-common/src/main/java/org/geogebra/web/html5/main/AsyncManager.java)
