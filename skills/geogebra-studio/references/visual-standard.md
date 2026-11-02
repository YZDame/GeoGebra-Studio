# Viewer visual standard

- Use the full responsive viewport and preserve equal x/y units. Never stretch the canvas by independent CSS transforms.
- Keep the sidebar toggle in the header at the left; theme, light/dark toggle and download controls align right. The native object editor opens within the applet.
- Default: no title, legend or explanation overlay, unless requested. Geometry labels must be legible.
- Default theme is light with nine theme families (Default, Ayu, Catppuccin, Everforest, Gruvbox, Rosé Pine, Nord, Solarized, Flexoki); light/dark and native canvas backgrounds synchronize.
- Keep the normal theme-colored outer canvas border in light mode; hide it in dark mode. Disable the GeoGebra applet's own border in both modes so it cannot add a second, white frame.
- Preserve the native applet frame's border width: its internal sizing subtracts that width. Hide the border with a transparent color, not `border:0`, and synchronize the frame background with the active theme to prevent exposed white strips. Keep the native in-canvas style bar disabled; controls belong outside the canvas.
- 3D default uses small native points, thin edges, faint fills, proper LaTeX labels and a preserved viewing camera. The applet should keep user-defined styles after theme switches.
- Preserve editability and current-state HTML/GGB exports. Inspect in light/dark, 2D/3D, mobile/desktop viewports.
- Official GeoGebra applet requires internet; no offline engine is bundled.
