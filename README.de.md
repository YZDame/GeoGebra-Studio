# GeoGebra Studio

[![CI](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml) [![License: GPL-2.0-or-later](https://img.shields.io/badge/license-GPL--2.0--or--later-blue.svg)](LICENSE) [![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522.12-339933?logo=node.js)](https://nodejs.org/) [![GitHub stars](https://img.shields.io/github/stars/YZDame/GeoGebra-Studio?style=flat)](https://github.com/YZDame/GeoGebra-Studio/stargazers)

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md)

**Ein portabler Agent Skill zum Erstellen, Bearbeiten und Exportieren interaktiver mathematischer GeoGebra-Konstruktionen.**

![GeoGebra construction](docs/images/right-triangle.png)

## Funktionen

- Native, editierbare GeoGebra-Figuren in 2D/3D mit abhängigen Objekten und Algebra-Ansicht.
- Responsiver Viewer mit neun Themenfamilien sowie Hell-/Dunkelmodus.
- Sieben Downloads im Viewer: **GGB, HTML, PNG, SVG, PDF, XML und TikZ**.
- Zusätzlicher lokaler Export aus XML nach **Asymptote** und **gemischtem TSQX/Asymptote**.
- Für den normalen Einsatz sind weder MCP-Server noch Backend oder Datenbank erforderlich.

## Voraussetzungen

Node.js **ab 22.12**. Zum Öffnen des erzeugten HTML ist Internet nötig, da die offizielle GeoGebra-Engine online geladen wird.

## Empfohlene Installation

Installiere die Skill aus GitHub in einer Agent-Skills-kompatiblen Umgebung. Alternativ den **vollständigen** Ordner `skills/geogebra-studio/` einschließlich `SKILL.md`, `scripts/`, `references/` und `runtime/` kopieren. Nur `SKILL.md` reicht nicht aus. Der Agent benötigt Schreib- und Shell-Rechte.

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

## Optionales Codex-Plugin

Das Codex-Plugin ist optional. Version **0.5.0** ist auf npm veröffentlicht. Codex nach der Installation neu starten.

```sh
npx @lydt/geogebra-studio@0.5.0 install
```

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

Weitere Informationen: [Leitfaden für Lehrkräfte](docs/TEACHER-QUICKSTART.md), [Beispiele](examples/), [Architektur](docs/MODERNIZATION.md) und [Mitwirken](CONTRIBUTING.md).

Unabhängiges Community-Projekt ohne Zugehörigkeit zu GeoGebra. Kombinierte Lizenz **GPL-2.0-or-later**. Siehe [LICENSE](LICENSE), [LICENSE-MIT](LICENSE-MIT) und [Drittanbieterhinweise](THIRD_PARTY_NOTICES.md).
