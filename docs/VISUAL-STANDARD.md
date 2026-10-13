# GeoGebra Studio viewer standard (v1)

The official Classic applet renders all geometry. Local HTML carries a real packed
GGB by default; generated previews are evidence for visual review, not substitutes.

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
  Upper right: theme, separate light/dark icon, download. Upper left of the graphics
  panel: native Algebra View toggle. Keep manual object definition/style editing.
- Nine light/dark pairs: Default, Ayu, Catppuccin, Everforest, Gruvbox, Rosé Pine,
  Nord, Solarized, Flexoki. Default light, remember selection. Theme ordinary geometry
  while preserving user custom colors. Clipper-derived tokens retain MIT notices.
- Seven current-state downloads: GGB (ZIP bytes), PNG, SVG, cleaned TikZ, PDF, XML,
  HTML. Saved HTML retains packed geometry, themes, browser cleaner and licensing.
- TikZ uses native PGF then the SAME built-in Gikz core used by MCP/CLI. No fallback.
- Time-bounded loading with specific errors. Official assets require internet;
  current runtime exposes exportPGF but availability is checked before using it.

HTML exports are visual and editable native artifacts. Static source exports have
format-specific limitations. Never infer complete semantic preservation from a
screenshot, cleaned source, successful load, or successful compilation.
