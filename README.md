# GeoGebra Studio

[![CI](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml) [![License: GPL-2.0-or-later](https://img.shields.io/badge/license-GPL--2.0--or--later-blue.svg)](LICENSE) [![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522.12-339933?logo=node.js)](https://nodejs.org/) [![GitHub stars](https://img.shields.io/github/stars/YZDame/GeoGebra-Studio?style=flat)](https://github.com/YZDame/GeoGebra-Studio/stargazers)

Tell AI what you want to draw, or send it a document or reference image. GeoGebra Studio helps it turn your request into an interactive GeoGebra page. Draw in 2D or 3D, drag points, make changes, and export the result.

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md)

<img src="docs/images/cover.png" alt="AI-generated 3D geometry with a movable cross-section" width="100%">

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

### Any client that supports Agent Skills

For Codex, Claude Code, Cursor and other clients that support Agent Skills:

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

Follow the prompts to choose your client and installation scope. You can also copy the entire [`skills/geogebra-studio/`](skills/geogebra-studio/) folder into your client's Skills directory. Keep the whole folder, including the files alongside `SKILL.md`.

### Codex plugin

Alternatively, use the dedicated installer, then restart your Codex session:

```sh
npx @lydt/geogebra-studio@latest install
```

### DeepSeek Harness

Install the plugin, then restart DeepSeek Harness.

```sh
dsh plugin --profile web add dsh-geogebra-studio
```

Use `--profile desktop` for the Desktop app. The plugin adds **GeoGebra Studio** to the left sidebar beside Plugins, Automation and Tasks; selecting it opens a live, editable canvas in the right sidebar while the conversation stays open. `geogebra_build` renders figures into that canvas, `geogebra_preview` is only for a standalone link, and `geogebra_export` handles TSQX, Asymptote and TikZ. It also includes the `geogebra-studio` Skill. See the [plugin instructions](plugins/dsh-geogebra-studio/) for details.
<img src="docs/images/dsh-right-canvas.png" alt="GeoGebra Studio opens a live canvas in the right sidebar while the chat stays open" width="100%">


See [installation and troubleshooting](skills/geogebra-studio/references/installation.md) for more details.

## Resources

[Examples](examples/README.md) · [Teacher walkthrough](docs/TEACHER-QUICKSTART.md) · [Development and contributing](CONTRIBUTING.md)

An independent community project. Licensed under [GPL-2.0-or-later](LICENSE), with [prior MIT attributions](LICENSE-MIT) and [third-party notices](THIRD_PARTY_NOTICES.md) retained.
