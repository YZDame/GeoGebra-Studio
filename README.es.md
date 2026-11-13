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

**Una Agent Skill portátil para crear, editar y exportar construcciones matemáticas interactivas con GeoGebra.**

## Cómo funciona

| Generar | Editar | Exportar |
| --- | --- | --- |
| ![La terminal ejecuta generate y preview (con ZoomIn); el visor local carga el triángulo rectángulo con la circunferencia circunscrita completa.](docs/images/generate.gif) | ![En la vista Álgebra, b pasa de 4 a 3 y luego h de 3 a 4; el triángulo y la circunferencia completa se actualizan al momento.](docs/images/edit.gif) | ![Menú Download con GGB, PNG, SVG, TikZ, PDF, XML y HTML; clics en SVG y TikZ, y después el código TikZ exportado.](docs/images/export.gif) |
| Del JSON de comandos al visor local interactivo ya encuadrado. | Cambia un valor libre. Los objetos dependientes conservan sus relaciones. | Una construcción. Siete formatos desde el menú Download real. |

## Funciones principales

- Figuras nativas editables en 2D y 3D, con relaciones de dependencia y vista algebraica.
- Visor adaptable, nueve familias de temas y modos claro/oscuro.
- Siete descargas desde el visor: **GGB, HTML, PNG, SVG, PDF, XML y TikZ**.
- Exportaciones locales adicionales a **Asymptote** y **TSQX/Asymptote mixto** a partir de XML.
- Sin servidor MCP, backend ni base de datos para el uso habitual.

## Requisitos

Node.js **22.12 o superior**. Para abrir el HTML generado hace falta conexión a Internet porque se carga el motor oficial de GeoGebra.

## Instalación

### 1. Instalación general

Para Codex, Claude Code, Cursor y otros clientes compatibles con Agent Skills. Sigue las indicaciones para elegir el cliente y el ámbito de instalación.

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

### 2. Instalación en Codex

Ejecuta el instalador y abre una nueva sesión de Codex.

```sh
npx @lydt/geogebra-studio@latest install
```

<img src="docs/images/cover.png" alt="Codex en macOS: una pregunta en chino sobre si GeoGebra Studio puede dibujar geometría sólida de bachillerato en 3D, junto a un cuarto de cilindro con una sección móvil a la altura h." width="100%">

### 3. Instalación en DeepSeek Harness

En la aplicación de escritorio, abre **Plugins → Add Plugin**, pega el nombre del paquete e instálalo.

```text
dsh-geogebra-studio
```

Abre **GeoGebra Studio** desde la barra lateral izquierda. La [guía del plugin](plugins/dsh-geogebra-studio/) incluye la instalación por terminal.

<img src="docs/images/dsh-right-canvas.png" alt="Elipse con una cuerda focal ajustable en DeepSeek Harness" width="100%">

## Inicio rápido

Crea `diagram.json` y pide a tu agente que use la Skill, o ejecuta el generador:

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

## Editar y guardar

Abre el HTML en un navegador, arrastra puntos libres y edita objetos mediante la vista algebraica. **Descarga el HTML o GGB actual antes de cerrar o recargar**: los cambios no se guardan automáticamente en los archivos originales. El HTML descargado conserva la construcción editable.

## Exportación de código fuente

Descarga el XML actual desde el visor (o usa `await window.geogebraStudio.snapshot()`) y ejecuta los comandos siguientes. TSQX es **mixto con Asymptote**, no TSQX puro; las dependencias no compatibles provocan errores explícitos.

```sh
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs export --input /absolute/project/figure.xml --format tsqx --workspace /absolute/project --output figure.tsqx
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs export --input /absolute/project/figure.xml --format asymptote --workspace /absolute/project --output figure.asy
```

## Desarrollo y comprobación

```sh
npm ci
npm run verify
npm run test:unit
```

Los tests reales del navegador requieren Chrome e Internet; la generación local cotidiana no requiere ninguno de los dos ni MCP.

Más información: [Galería interactiva](https://yzdame.github.io/GeoGebra-Studio/), [ejemplos](examples/README.md), [arquitectura](docs/MODERNIZATION.md) y [colaboración](CONTRIBUTING.md).

Proyecto comunitario independiente, sin afiliación con GeoGebra. Licencia combinada **GPL-2.0-or-later**. Véanse [LICENSE](LICENSE), [LICENSE-MIT](LICENSE-MIT) y [avisos de terceros](THIRD_PARTY_NOTICES.md).
