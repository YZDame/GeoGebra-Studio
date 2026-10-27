# GeoGebra Studio viewer standard (v1)

The official Classic applet renders all geometry. Default HTML carries ordered commands, opened in the agent/client browser.
Downloaded current-state HTML carries packed GGB. Background Chrome verification
and preview screenshots are optional; inspect the visible diagram for visual quality.

- Full available viewport, responsive ResizeObserver, isotropic x/y coordinates.
  Never stretch a native canvas with independent CSS width/height scales.
- Show both coordinate axes for every diagram defined or interpreted in a Cartesian
  coordinate system; use `showAxes: true` in the HTML artifact options. This rule
  overrides the general axes-hidden default. Hide axes/grid for non-coordinate figures.
  Initialize all native UI first, then hide toolbar/menu/input: initializing with UI
  disabled breaks later editing in Classic.
- Native LaTeX Text labels, fixed auxiliary helpers, normal native labels hidden.
  GeoGebra Text needs its fourth boolean. Its string escaping differs from JS.
- Shared buttons: 38px height, 9px radius; matching custom popovers, no native select.
  Header: native Algebra View toggle left; theme, separate light/dark icon and downloads right, all outside the canvas. Keep manual object definition/style editing.
- Nine light/dark pairs: Default, Ayu, Catppuccin, Everforest, Gruvbox, Rosé Pine,
  Nord, Solarized, Flexoki. Default light, remember selection. Theme ordinary geometry
  while preserving user custom colors. Clipper-derived tokens retain MIT notices.
- Seven current-state downloads: GGB (ZIP bytes), PNG, SVG, cleaned TikZ, PDF, XML,
  HTML. Saved HTML retains packed geometry, themes, browser cleaner and licensing.
- TikZ uses native PGF then the SAME built-in Gikz core used by MCP/CLI. No fallback.
- Time-bounded loading with specific errors. Official assets require internet;
  current runtime exposes exportPGF but availability is checked before using it.

## 3D solid geometry

- Set `mode: "3D"`; preserve 2D as the backward-compatible default. Use the native
  3D perspective for loading, sidebar editing, resizing and current-HTML reopening.
- Point size 1, ordinary line weight 1, highlighted line weight 2. Preserve explicit
  user styling. Prefer faint fills and restrained highlight colors.
- Use native LaTeX Text labels attached to 3D points, with proper subscripts.
  `labelOffsets` provides world-coordinate adjustments for crowded labels.
- No explanation overlays, legends, formula cards or titles unless requested.
- Hide the native coordinate plane and grid in geometric figures. Axes are visible
  when `showAxes` is true. `view3D` optionally supplies bounds and viewing direction.
- Apply the selected palette's paper color to graphics settings **view 3**, including
  every light/dark change. HTML and the native 3D canvas must have matching backgrounds.
- Measure the rendered 3D canvas and native 3D scale for verification. The Apps API's
  `getViewProperties` describes 2D only and cannot verify a hidden 3D view.

HTML exports are visual and editable native artifacts. Static source exports have
format-specific limitations. Never infer complete semantic preservation from a
screenshot, cleaned source, successful load, or successful compilation.
