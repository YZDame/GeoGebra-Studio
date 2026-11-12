# GeoGebra Studio

[![CI](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml) [![License: GPL-2.0-or-later](https://img.shields.io/badge/license-GPL--2.0--or--later-blue.svg)](LICENSE) [![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522.12-339933?logo=node.js)](https://nodejs.org/) [![GitHub stars](https://img.shields.io/github/stars/YZDame/GeoGebra-Studio?style=flat)](https://github.com/YZDame/GeoGebra-Studio/stargazers)

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md)

**Ein portabler Agent Skill zum Erstellen, Bearbeiten und Exportieren interaktiver mathematischer GeoGebra-Konstruktionen.**

## So funktioniert es

<img src="docs/images/cover.png" alt="Codex unter macOS: eine chinesische Frage, ob GeoGebra Studio 3D-Raumgeometrie der Oberstufe zeichnen kann, neben einem Viertelzylinder mit verschiebbarem Querschnitt auf Höhe h." width="100%">

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

## Empfohlene Installation

Installiere die Skill aus GitHub in einer Agent-Skills-kompatiblen Umgebung. Alternativ den **vollständigen** Ordner `skills/geogebra-studio/` einschließlich `SKILL.md`, `scripts/`, `references/` und `runtime/` kopieren. Nur `SKILL.md` reicht nicht aus. Der Agent benötigt Schreib- und Shell-Rechte.

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

## DeepSeek Harness

DeepSeek Harness (`dsh`) kann GeoGebra Studio auf zwei getrennten Wegen verwenden. Der Agent Skill erzeugt die Figuren. Die veröffentlichte `SKILL.md` hat bereits den erforderlichen kebab-case `name` und `description`; das Frontmatter bleibt unverändert. Optionales `whenToUse` fehlt absichtlich, weil der Katalog über `name` und `description` routet. Die Seitenleisten-Schaltfläche ist ein anderes Paket, [`plugins/dsh-geogebra-studio/`](plugins/dsh-geogebra-studio/). `dsh plugin add` nicht auf das Repository-Wurzelverzeichnis, auf `@lydt/geogebra-studio` oder auf `skills/geogebra-studio/` anwenden. Das sind nicht die Seitenleisten-Plugins.

Derselbe Installer wie bei den anderen Clients. Im Standardmodus liegt eine vollständige Kopie unter `.agents/skills/geogebra-studio`, und DeepSeek Harness durchsucht dieses Verzeichnis bereits:

- Ohne `-g`: `./.agents/skills/geogebra-studio` im aktuellen Verzeichnis. DeepSeek Harness findet sie, wenn das Git-Stammverzeichnis dieses Projekts der Workspace ist. Fragt der Installer nach dem Bereich, ist die Projektauswahl dieser Pfad.
- Mit `-g`, oder Global in der Abfrage: `~/.agents/skills/geogebra-studio`. DeepSeek Harness durchsucht dieses Verzeichnis in jedem Workspace.

Für die Kopie im Home-Verzeichnis `-g` angeben. Zusätzliche Links wie `~/.claude/skills` oder `~/.cursor/skills` gehören zu anderen Clients. DeepSeek Harness durchsucht `~/.dsh/skills`, `~/.agents/skills` sowie `.dsh/skills` und `.agents/skills` im Projekt. Den Standardmodus beibehalten, damit die Kopie unter `.agents/skills` entsteht. `--copy` überspringt dieses Verzeichnis.

Manuell den **gesamten** Ordner `skills/geogebra-studio/` kopieren, einschließlich `SKILL.md`, `scripts/`, `references/` und `runtime/`:

- `~/.dsh/skills/geogebra-studio`
- `~/.agents/skills/geogebra-studio`

Im Chat mit `/geogebra-studio` aufrufen.

Als DeepSeek-Harness-Workspace geöffnet, wird `skills/geogebra-studio/` nicht automatisch gefunden. Die Suche umfasst nur die direkten Kinder von `.dsh/skills` und `.agents/skills`. Den ganzen Ordner nach `.dsh/skills/geogebra-studio` oder `.agents/skills/geogebra-studio` im Workspace kopieren. Für eine reine Workspace-Kopie `.dsh/skills/geogebra-studio` bevorzugen. Dieses Repository committet weder diese Kopie noch einen Symlink: Git unter Windows schreibt Symlinks oft als Textdateien, und `.agents/skills` ist bereits das Installationsverzeichnis von Codex, Cursor und `npx skills`. `.agents/plugins` bleibt der optionale Codex-Marktplatz-Eintrag.

### Seitenleisten-Schaltfläche

Das Seitenleisten-Plugin in das Web-Profil installieren und danach `dsh web` neu starten. Die GitHub-Adresse in Anführungszeichen setzen, damit pnpm das Unterverzeichnis behält:

```sh
dsh plugin --profile web add "github:YZDame/GeoGebra-Studio#main&path:plugins/dsh-geogebra-studio"
```

Aus einem Checkout dieses Repositorys:

```sh
dsh plugin --profile web add ./plugins/dsh-geogebra-studio
```

Das Plugin trägt einen Eintrag in die offizielle Liste `sidebar.footer.action` ein, im Seitenleistenfuß über den Einstellungen. Eine breite Seitenleiste zeigt ein Geometrie-Symbol und die Beschriftung GeoGebra. Die schmale Leiste zeigt nur das Symbol. Ein Klick öffnet eine Anleitung: `/geogebra-studio` aufrufen, Node.js 22.12+ und die HTTP-Vorschau, ein kopierbarer Starttext und der Hinweis auf das unabhängige Projekt. Die Schaltfläche installiert den Skill nicht und zeichnet keine Figur. Unter Windows kann ein älteres `dsh` die GitHub-Adresse an `cmd.exe` geben; `&` wird dann zum Befehlstrennzeichen und es wird das Repository-Wurzelverzeichnis installiert. In dem Fall den Checkout-Pfad verwenden.

Dieselben Voraussetzungen: Node.js 22.12+, Datei- und Shell-Zugriff, und die HTTP-Vorschau, wenn der Client Loopback-URLs öffnen kann. GeoGebra Studio ist ein unabhängiges Projekt und nicht mit GeoGebra verbunden.

## Optionales Codex-Plugin

Das Codex-Plugin ist optional. Version **0.6.0** ist auf npm veröffentlicht. Codex nach der Installation neu starten.

```sh
npx @lydt/geogebra-studio@0.6.0 install
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
