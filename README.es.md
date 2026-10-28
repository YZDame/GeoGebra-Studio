# GeoGebra Studio

[![CI](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml) [![License: GPL-2.0-or-later](https://img.shields.io/badge/license-GPL--2.0--or--later-blue.svg)](LICENSE) [![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522.12-339933?logo=node.js)](https://nodejs.org/) [![GitHub stars](https://img.shields.io/github/stars/YZDame/GeoGebra-Studio?style=flat)](https://github.com/YZDame/GeoGebra-Studio/stargazers)

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md)

**Una Agent Skill portátil para crear, editar y exportar construcciones matemáticas interactivas con GeoGebra.**

![GeoGebra construction](docs/images/right-triangle.png)

## Funciones principales

- Figuras nativas editables en 2D y 3D, con relaciones de dependencia y vista algebraica.
- Visor adaptable, nueve familias de temas y modos claro/oscuro.
- Siete descargas desde el visor: **GGB, HTML, PNG, SVG, PDF, XML y TikZ**.
- Exportaciones locales adicionales a **Asymptote** y **TSQX/Asymptote mixto** a partir de XML.
- Sin servidor MCP, backend ni base de datos para el uso habitual.

## Requisitos

Node.js **22.12 o superior**. Para abrir el HTML generado hace falta conexión a Internet porque se carga el motor oficial de GeoGebra.

## Instalación recomendada

Instala la Skill desde GitHub en un entorno compatible con Agent Skills. Como alternativa, copia **toda** la carpeta `skills/geogebra-studio/`, incluidos `SKILL.md`, `scripts/`, `references/` y `runtime/`. Copiar solo `SKILL.md` no basta. El agente necesita acceso a escritura y shell.

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

## Codex Plugin opcional

El Plugin es un envoltorio opcional. **La versión 0.5.0 está prevista, pero todavía no está publicada**; hasta entonces utiliza el código compilado o la Skill independiente. Reinicia Codex después de instalarla.

```sh
npx @lydt/geogebra-studio@0.5.0 install
```

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

Más información: [guía para profesores](docs/TEACHER-QUICKSTART.md), [ejemplos](examples/), [arquitectura](docs/MODERNIZATION.md) y [colaboración](CONTRIBUTING.md).

Proyecto comunitario independiente, sin afiliación con GeoGebra. Licencia combinada **GPL-2.0-or-later**. Véanse [LICENSE](LICENSE), [LICENSE-MIT](LICENSE-MIT) y [avisos de terceros](THIRD_PARTY_NOTICES.md).
