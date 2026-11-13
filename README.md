<p align="center"><img src="assets/geogebra-icon.png" width="80" height="80" alt=""></p>
<h1 align="center">GeoGebra Studio</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@lydt/geogebra-studio"><img src="https://img.shields.io/npm/v/@lydt/geogebra-studio?label=Studio%20npm" alt="GeoGebra Studio npm version"></a>
  <a href="https://www.npmjs.com/package/dsh-geogebra-studio"><img src="https://img.shields.io/npm/v/dsh-geogebra-studio?label=DSH%20npm" alt="DeepSeek Harness plugin npm version"></a>
  <a href="https://www.npmjs.com/package/@lydt/geogebra-studio"><img src="https://img.shields.io/npm/dm/@lydt/geogebra-studio?label=Studio%20downloads" alt="GeoGebra Studio monthly npm downloads"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-GPL--2.0--or--later-blue.svg" alt="License: GPL-2.0-or-later"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-%E2%89%A522.12-339933?logo=node.js" alt="Node.js 22.12 or later"></a>
  <a href="https://github.com/YZDame/GeoGebra-Studio/stargazers"><img src="https://img.shields.io/github/stars/YZDame/GeoGebra-Studio?style=flat" alt="GitHub stars"></a>
</p>

Tell AI what you want to draw, or send it a document or reference image. GeoGebra Studio helps it turn your request into an interactive GeoGebra page. Draw in 2D or 3D, drag points, make changes, and export the result.

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md)

## Usage

After installing, ask your AI to draw something:

> Draw a triangle and its circumcircle. Let me drag the vertices.

You can also upload a problem document or reference image and ask AI to draw from it. Upload options depend on your AI client.

Open the generated page to drag points and change values, or ask AI for further changes.

**Download the current HTML or GGB before closing or refreshing to save your edits.**

| Generate | Edit | Export |
| --- | --- | --- |
| ![Generate an interactive figure](docs/images/generate.gif) | ![Change values and watch the figure update](docs/images/edit.gif) | ![Choose a format and download](docs/images/export.gif) |

## Features

- 2D and 3D figures with draggable points and adjustable values.
- Download **HTML, GGB, PNG, SVG, PDF, XML and TikZ** from the page.
- Export Asymptote and mixed TSQX/Asymptote source through AI; see [export details](skills/geogebra-studio/references/exports.md).

## Installation

Use it on macOS, Windows or Linux with **Node.js 22.12 or later**. Your AI client needs file and shell access. Opening a generated page requires internet access to load GeoGebra.

### 1. General installation

For Codex, Claude Code, Cursor and other clients that support Agent Skills. Follow the prompts to choose your client and installation scope.

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

You can also copy the entire [`skills/geogebra-studio/`](skills/geogebra-studio/) folder into your client's Skills directory. Keep the whole folder, including the files alongside `SKILL.md`.

### 2. Install in Codex

Run the Codex plugin installer and open a new Codex session.

```sh
npx @lydt/geogebra-studio@latest install
```

<img src="docs/images/cover.png" alt="AI-generated 3D geometry with a movable cross-section" width="100%">

### 3. Install in DeepSeek Harness

In the desktop app, open **Plugins → Add Plugin**, paste the package name below, and install it.

```text
dsh-geogebra-studio
```

Open **GeoGebra Studio** from the left sidebar to use the interactive canvas beside your chat. See the [plugin guide](plugins/dsh-geogebra-studio/) for command-line installation.

<img src="docs/images/dsh-right-canvas.png" alt="Ellipse with its foci, directrices and an adjustable focal chord in the DeepSeek Harness canvas" width="100%">

See [installation and troubleshooting](skills/geogebra-studio/references/installation.md) for more details.

## Resources

[Examples](examples/README.md) · [Interactive gallery](https://yzdame.github.io/GeoGebra-Studio/) · [Development and contributing](CONTRIBUTING.md)

An independent community project. Licensed under [GPL-2.0-or-later](LICENSE), with [prior MIT attributions](LICENSE-MIT) and [third-party notices](THIRD_PARTY_NOTICES.md) retained.
