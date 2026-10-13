# GeoGebra Studio

[![npm next version](https://img.shields.io/npm/v/%40lydt%2Fgeogebra-studio/next?label=npm%20%28next%29)](https://www.npmjs.com/package/@lydt/geogebra-studio)
[![npm monthly downloads](https://img.shields.io/npm/dm/%40lydt%2Fgeogebra-studio)](https://www.npmjs.com/package/@lydt/geogebra-studio)
[![GitHub stars](https://img.shields.io/github/stars/YZDame/GeoGebra-Studio)](https://github.com/YZDame/GeoGebra-Studio)
[![License](https://img.shields.io/github/license/YZDame/GeoGebra-Studio)](LICENSE)

**Create editable GeoGebra diagrams by describing the geometry you want.** GeoGebra Studio is a Codex plugin that builds a local HTML page with an interactive construction. You can move points, edit objects, and download the diagram in several formats.

[中文说明](README.zh-CN.md) · [GitHub](https://github.com/YZDame/GeoGebra-Studio) · [npm](https://www.npmjs.com/package/@lydt/geogebra-studio)

## Install

You need [Codex](https://openai.com/codex/) and Node.js 22.12 or newer. In a terminal, run:

```sh
npx @lydt/geogebra-studio@0.4.0-rc.2 install
```

Open a **new Codex chat** after installation and ask for a diagram. The installer uses Chrome if available; otherwise it downloads Chromium for the plugin.

> Version `0.4.0-rc.2` is a preview release. It is published under npm's `next` tag while the final `0.4.0` release is being prepared.

## Try it

For example, ask Codex:

> Draw the circles Γ: x² + y² = 25 and ω: (x − 3)² + y² = 64/25. Let A move on Γ. Draw the two tangents from A to ω, and label their other intersections with Γ as B and C. Save an editable HTML diagram in my project.

GeoGebra Studio creates the HTML file in your project and shows a preview. Open the file in a browser to continue working with it.

## Edit and export

Drag points to explore the construction. Use the button beside the canvas to show GeoGebra's object list and edit definitions or styles. The controls in the upper right let you change the theme and download the current diagram.

- **GGB** keeps the editable GeoGebra construction.
- **HTML** keeps the interactive diagram in one local file.
- **SVG, PDF, PNG** are useful for documents and handouts.
- **TikZ** exports a cleaned, static LaTeX drawing.
- **XML** contains the construction data.

## A note about internet access

GeoGebra's drawing engine is loaded from GeoGebra's website, so you need an internet connection when creating or opening the interactive diagram. Your saved HTML file is local, but it is not an offline copy of GeoGebra.

GeoGebra Studio is an independent community project and is not affiliated with GeoGebra.
