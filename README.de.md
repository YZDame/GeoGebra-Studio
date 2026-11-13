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

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md)

**Ein portabler Agent Skill zum Erstellen, Bearbeiten und Exportieren interaktiver mathematischer GeoGebra-Konstruktionen.**

## So funktioniert es

| Erzeugen | Bearbeiten | Exportieren |
| --- | --- | --- |
| ![Im Terminal generate und preview (einschließlich ZoomIn); der lokale Viewer lädt das rechtwinklige Dreieck mit vollständig sichtbarem Umkreis.](docs/images/generate.gif) | ![Algebra-Ansicht: b von 4 auf 3, danach h von 3 auf 4; Dreieck und vollständiger Umkreis aktualisieren sich sofort.](docs/images/edit.gif) | ![Download-Menü mit GGB, PNG, SVG, TikZ, PDF, XML und HTML; Klicks auf SVG und TikZ, danach der exportierte TikZ-Quelltext.](docs/images/export.gif) |
| Von Befehls-JSON zum vorausgerichteten lokalen interaktiven Viewer. | Einen freien Wert ändern. Abhängige Objekte behalten ihre Beziehungen. | Eine Konstruktion. Sieben Formate aus dem echten Download-Menü. |

## Funktionen

- Native, editierbare GeoGebra-Figuren in 2D/3D mit abhängigen Objekten und Algebra-Ansicht.
- Responsiver Viewer mit neun Themenfamilien sowie Hell-/Dunkelmodus.
- Sieben Downloads im Viewer: **GGB, HTML, PNG, SVG, PDF, XML und TikZ**.
- Zusätzlicher lokaler Export aus XML nach **Asymptote** und **gemischtem TSQX/Asymptote**.
- Für den normalen Einsatz sind weder MCP-Server noch Backend oder Datenbank erforderlich.

## Voraussetzungen

Node.js **ab 22.12**. Zum Öffnen des erzeugten HTML ist Internet nötig, da die offizielle GeoGebra-Engine online geladen wird.

## Installation

### 1. Allgemeine Installation

Für Codex, Claude Code, Cursor und andere Clients mit Agent Skills. Folge den Anweisungen zur Auswahl des Clients und des Installationsbereichs.

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

### 2. Installation in Codex

Führe den Befehl aus und öffne eine neue Codex-Sitzung.

```sh
npx @lydt/geogebra-studio@latest install
```

<img src="docs/images/cover.png" alt="Codex unter macOS: eine chinesische Frage, ob GeoGebra Studio 3D-Raumgeometrie der Oberstufe zeichnen kann, neben einem Viertelzylinder mit verschiebbarem Querschnitt auf Höhe h." width="100%">

### 3. Installation in DeepSeek Harness

Öffne in der Desktop-App **Plugins → Add Plugin**, füge den Paketnamen ein und installiere das Plugin.

```text
dsh-geogebra-studio
```

Öffne **GeoGebra Studio** in der linken Seitenleiste. Die [Plugin-Anleitung](plugins/dsh-geogebra-studio/) beschreibt auch die Installation per Kommandozeile.

<img src="docs/images/dsh-right-canvas.png" alt="Ellipse mit verstellbarer Brennpunktsehne in DeepSeek Harness" width="100%">

## Schnellstart

Lege `diagram.json` an und verwende die Skill im Agent oder starte den lokalen Generator:

```json
{
  "filename": "circle.html",
  "commands": ["A=(0,0)", "B=(4,0)", "c=Circle(A,B)"],
  "visibleLabels": ["A", "B"]
}
```

```sh
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs generate --input /absolute/project/diagram.json --workspace /absolute/project
```

## Bearbeiten und speichern

Öffne das HTML im Browser, verschiebe freie Punkte oder bearbeite Objekte in der Algebra-Ansicht. **Vor dem Schließen oder Neuladen das aktuelle HTML oder GGB herunterladen**: Die Originaldateien werden nicht automatisch aktualisiert. Das heruntergeladene HTML bewahrt die editierbare Konstruktion.

## Quellcode-Export

Lade das aktuelle XML aus dem Viewer herunter (oder nutze `await window.geogebraStudio.snapshot()`) und führe die folgenden Befehle aus. TSQX ist **mit Asymptote gemischt**, kein reines TSQX; nicht unterstützte Abhängigkeiten werden ausdrücklich abgelehnt.

```sh
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs export --input /absolute/project/figure.xml --format tsqx --workspace /absolute/project --output figure.tsqx
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs export --input /absolute/project/figure.xml --format asymptote --workspace /absolute/project --output figure.asy
```

## Entwicklung und Tests

```sh
npm ci
npm run verify
npm run test:unit
```

Optionale Tests im echten Browser benötigen Chrome und Internet. Für die normale lokale Generierung sind weder Chrome noch ein MCP-Server nötig.

Weitere Informationen: [Interaktive Galerie](https://yzdame.github.io/GeoGebra-Studio/), [Beispiele](examples/README.md), [Architektur](docs/MODERNIZATION.md) und [Mitwirken](CONTRIBUTING.md).

Unabhängiges Community-Projekt ohne Zugehörigkeit zu GeoGebra. Kombinierte Lizenz **GPL-2.0-or-later**. Siehe [LICENSE](LICENSE), [LICENSE-MIT](LICENSE-MIT) und [Drittanbieterhinweise](THIRD_PARTY_NOTICES.md).
