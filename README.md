# GeoGebra Studio

[![CI](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml) [![License: GPL-2.0-or-later](https://img.shields.io/badge/license-GPL--2.0--or--later-blue.svg)](LICENSE) [![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522.12-339933?logo=node.js)](https://nodejs.org/) [![GitHub stars](https://img.shields.io/github/stars/YZDame/GeoGebra-Studio?style=flat)](https://github.com/YZDame/GeoGebra-Studio/stargazers)

**A portable Agent Skill for editable mathematical constructions.** Describe a 2D or 3D figure, generate a local interactive GeoGebra HTML, inspect and edit it in a browser, then export the current construction.

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md)

![Right triangle rendered by the official GeoGebra applet](docs/images/right-triangle.png)

## What it does

- Native editable GeoGebra figures with free/dependent objects and Algebra View.
- Responsive 2D/3D viewer, nine theme families, light/dark mode and a toolbar outside the canvas.
- Seven in-viewer downloads: **GGB, HTML, PNG, SVG, PDF, XML, TikZ**.
- Additional local **Asymptote** and **mixed TSQX/Asymptote** source exports from GeoGebra XML.
- Bundled Gikz cleans native GeoGebra PGF before TikZ export.
- No MCP server, backend, database or separate Chrome setup for normal usage.

**Requirements:** Node.js 22.12+ and internet access when opening a generated HTML (GeoGebra's official engine is loaded remotely). No separate GeoGebra Studio npm installation is required for the standalone Skill.

## Install as an Agent Skill (recommended)

In an Agent Skills-compatible environment, install from the GitHub repository and select `geogebra-studio`:

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

Alternatively, copy **the entire** `skills/geogebra-studio/` folder into your agent's skills directory. It must contain `SKILL.md`, `scripts/`, `references/`, and the bundled `runtime/`. The runtime is packaged with the Skill; do not copy only SKILL.md. The CLI uses Node.js built-ins and bundled code, without `npm install`.

Agents need file-write/shell access. Open HTML in the client's built-in browser when available, or a normal browser. A built-in browser pane is **not** a universal Agent Skills feature. Native plugin installation has been developed for Codex; other clients require environment-specific verification.

## Optional Codex Plugin

The Codex distribution is only a convenience wrapper around the same Skill. With an npm release that includes this architecture:

```sh
npx @lydt/geogebra-studio@0.5.0 install
```

Restart the Codex session so installed Skills are reloaded. For source development, run `npm ci && npm run build`, then `node dist/cli.js install --local`. The repository is at **0.5.0**. If npm has not published this version yet, install the standalone Skill from GitHub or use a built checkout.

## Quick start

Write `diagram.json` in your working directory:

```json
{
  "filename": "circle.html",
  "commands": ["A=(0,0)", "B=(4,0)", "c=Circle(A,B)"],
  "visibleLabels": ["A", "B"]
}
```

Then ask your agent to use the installed `geogebra-studio` Skill. Or run directly:

```sh
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs generate --input /absolute/project/diagram.json --workspace /absolute/project
```

Open the resulting HTML in the agent browser panel or any modern browser. If `file://` navigation is blocked, serve the workspace using a localhost-only static server (`python3 -m http.server 8765 --bind 127.0.0.1 --directory /absolute/project`), then open the corresponding URL.

The generator writes **new files only**; it does not execute or validate the geometry. The viewer reports errors, but a mathematical/visual check requires inspection of the actual figure.

## Edit, save and export

Drag free points or open the native object editor using the toolbar's left button. Theme and download controls are aligned to the right. User edits are not automatically written back to the original JSON/HTML: **download current HTML or GGB before closing or refreshing.** Current HTML embeds packed GGB and preserves edits when reopened.

For additional source formats, download the current XML from the viewer (or obtain `await window.geogebraStudio.snapshot()` in the page), then run:

```sh
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs export --input /absolute/project/figure.xml --format tsqx --workspace /absolute/project --output figure.tsqx
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs export --input /absolute/project/figure.xml --format asymptote --workspace /absolute/project --output figure.asy
```

These exports cover a documented semantic subset and reject unsupported dependencies rather than silently freezing them. TSQX is **mixed TSQX/Asymptote**, not pure TSQX. TikZ is a static visual snapshot generated via native GeoGebra PGF and bundled Gikz.

## Architecture

`Agent → SKILL.md → construction JSON → bundled local CLI/HTML viewer → official GeoGebra applet → current-state files`

The one Skill uses progressively loaded `references/` for construction, export, visual standards and troubleshooting. The standalone runtime and the Codex Plugin share the same build sources. The project ships no MCP server.

See [teacher walkthrough](docs/TEACHER-QUICKSTART.md), [sample constructions](examples/), [architecture](docs/MODERNIZATION.md), and [contributing](CONTRIBUTING.md).

## Develop and verify

```sh
npm ci
npm run verify
npm run test:unit
```

Optional browser/real-engine verification requires an available Chrome executable and internet. A clean Skill install is checked without installing dependencies inside the installed Skill.

GeoGebra Studio is an independent community project, not affiliated with GeoGebra. Combined distribution: GPL-2.0-or-later. Third-party notices and prior MIT attributions are retained in [LICENSE](LICENSE), [LICENSE-MIT](LICENSE-MIT) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
