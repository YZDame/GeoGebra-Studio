# Viewer visual standard

- Use the full responsive viewport and preserve equal x/y units. Never stretch the canvas by independent CSS transforms.
- Keep the sidebar toggle in the header at the left; theme, light/dark toggle and download controls align right. The native object editor opens within the applet.
- Default: no title, legend or explanation overlay, unless requested. Geometry labels must be legible.
- Default theme is light with nine theme families (Default, Ayu, Catppuccin, Everforest, Gruvbox, Rosé Pine, Nord, Solarized, Flexoki); light/dark and native canvas backgrounds synchronize.
- 3D default uses small native points, thin edges, faint fills, proper LaTeX labels and a preserved viewing camera. The applet should keep user-defined styles after theme switches.
- Preserve editability and current-state HTML/GGB exports. Inspect in light/dark, 2D/3D, mobile/desktop viewports.
- Official GeoGebra applet requires internet; no offline engine is bundled.
