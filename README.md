<p align="center"><img src="assets/geogebra-icon.png" width="80" height="80" alt=""></p>
<h1 align="center">GeoGebra Studio</h1>

<p align="center">
  <a href="skills/geogebra-studio/SKILL.md"><img src="https://img.shields.io/badge/Agent_Skill-geogebra--studio-0F766E" alt="Agent Skill: geogebra-studio"></a>
  <a href="https://yzdame.github.io/GeoGebra-Studio/"><img src="https://img.shields.io/badge/demo-GitHub_Pages-2563EB" alt="Interactive gallery on GitHub Pages"></a>
  <a href="https://www.npmjs.com/package/@lydt/geogebra-studio"><img src="https://img.shields.io/npm/v/@lydt/geogebra-studio?label=Studio%20npm" alt="GeoGebra Studio npm version"></a>
  <a href="https://www.npmjs.com/package/dsh-geogebra-studio"><img src="https://img.shields.io/npm/v/dsh-geogebra-studio?label=DSH%20npm" alt="DeepSeek Harness plugin npm version"></a>
  <a href="https://www.npmjs.com/package/@lydt/geogebra-studio"><img src="https://img.shields.io/npm/dm/@lydt/geogebra-studio?label=Studio%20downloads" alt="GeoGebra Studio monthly npm downloads"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-GPL--2.0--or--later-blue.svg" alt="License: GPL-2.0-or-later"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-%E2%89%A522.12-339933?logo=node.js" alt="Node.js 22.12 or later"></a>
  <a href="https://github.com/YZDame/GeoGebra-Studio/stargazers"><img src="https://img.shields.io/github/stars/YZDame/GeoGebra-Studio?style=flat" alt="GitHub stars"></a>
</p>

**GeoGebra Studio** is a standard **Agent Skill** (with optional Codex and DeepSeek Harness plugins). In Claude Code, Codex, Cursor, DeepSeek Harness, or any Agent Skills client, tell AI what you want to draw—or send a problem document or reference image—to get an interactive 2D/3D GeoGebra page you can drag, edit, and export. Want to try it first? Explore the [interactive gallery](https://yzdame.github.io/GeoGebra-Studio/) in your browser with no installation required.

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md)

## Quick Start

1. **Install the Agent Skill** (requires Node.js 22.12+; see [Installation](#installation) below for Cursor, Grok Bot, Codex, and DeepSeek Harness):

   ```sh
   npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
   ```

2. **Ask your AI to draw**, or upload a problem document or reference image (upload options depend on your AI client):

   > Draw a triangle and its circumcircle. Let me drag the vertices.

3. **Interact, edit, and export**: Open the generated page to drag points and adjust values, or ask AI for further changes. **Download the current HTML or GGB before closing or refreshing to save your edits.**

| Generate | Edit | Export |
| --- | --- | --- |
| ![Generate an interactive figure](docs/images/generate.gif) | ![Change values and watch the figure update](docs/images/edit.gif) | ![Choose a format and download](docs/images/export.gif) |

## Features

- 2D and 3D GeoGebra figures with draggable points, adjustable values, nine themes, and light/dark modes.
- Download **HTML, GGB, PNG, SVG, PDF, XML and TikZ** directly from the page.
- Export Asymptote and mixed TSQX/Asymptote source through AI; see [export details](skills/geogebra-studio/references/exports.md).
- Portable [`SKILL.md`](skills/geogebra-studio/SKILL.md) workflow with no MCP server, backend, or database required.

## Installation

Use GeoGebra Studio on macOS, Windows or Linux with **Node.js 22.12 or later**. Your AI client needs file and shell access. Opening a generated page requires internet access to load the official GeoGebra engine.

**Choose one of the following methods based on your AI client:**

### 1. General Agent Skill installation (recommended)

For Claude Code, Cursor, Codex and other clients that support Agent Skills. Follow the prompts to choose your client and installation scope.

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

You can also copy the entire [`skills/geogebra-studio/`](skills/geogebra-studio/) folder into your client's Skills directory. Keep the whole folder, including the files alongside `SKILL.md`.

### 2. Install in Codex (optional plugin)

Run the Codex plugin installer and open a new Codex session.

```sh
npx @lydt/geogebra-studio@latest install
```

<img src="docs/images/cover.png" alt="AI-generated 3D geometry with a movable cross-section" width="100%">

### 3. Install in DeepSeek Harness (interactive right-side canvas)

In the desktop app, open **Plugins → Add Plugin**, paste the package name below, and install it. The plugin bundles the `geogebra-studio` skill, so no separate Skill installation is needed.

```text
dsh-geogebra-studio
```

Open **GeoGebra Studio** from the left sidebar to use the interactive canvas beside your chat. See the [plugin guide](plugins/dsh-geogebra-studio/) for command-line installation.

<img src="docs/images/dsh-right-canvas.png" alt="Ellipse with its foci, directrices and an adjustable focal chord in the DeepSeek Harness canvas" width="100%">

### 4. Install in Cursor

Clone this repository and copy the repository directory to `~/.cursor/plugins/local/geogebra-studio`. Copy the files; do not use a symlink. The copy must contain `.cursor-plugin/plugin.json`. Then run Reload Window in Cursor. Node.js 22.12 or later is required.

Or copy only the [`skills/geogebra-studio/`](skills/geogebra-studio/) folder, including `scripts/`, `runtime/`, `references/`, and `examples/`, into a Cursor skills directory. [Cursor loads skills](https://cursor.com/docs/skills) from `~/.cursor/skills/` and `~/.agents/skills/` for your user, and from `.cursor/skills/` and `.agents/skills/` inside a project.

Ask Cursor to draw a figure. The skill writes a local HTML file. Opening that page needs a browser that can reach the official GeoGebra engine.

### 5. Install in Grok Bot

Ask Grok Bot to copy the whole [`skills/geogebra-studio/`](skills/geogebra-studio/) folder, including `scripts/`, `runtime/`, `references/`, and `examples/`, into its skill library. You can say: “从 https://github.com/YZDame/GeoGebra-Studio 安装 geogebra-studio 技能”. The machine it runs on needs Node.js 22.12 or later.

See [installation and troubleshooting](skills/geogebra-studio/references/installation.md) for more details.

## Resources

[Examples](examples/README.md) · [Interactive gallery](https://yzdame.github.io/GeoGebra-Studio/) · [Skill specification](skills/geogebra-studio/SKILL.md) · [Development and contributing](CONTRIBUTING.md)

An independent community project, not affiliated with GeoGebra. Licensed under [GPL-2.0-or-later](LICENSE), with [prior MIT attributions](LICENSE-MIT) and [third-party notices](THIRD_PARTY_NOTICES.md) retained.
