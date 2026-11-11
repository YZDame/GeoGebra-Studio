# GeoGebra Studio

[![CI](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml) [![License: GPL-2.0-or-later](https://img.shields.io/badge/license-GPL--2.0--or--later-blue.svg)](LICENSE) [![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522.12-339933?logo=node.js)](https://nodejs.org/) [![GitHub stars](https://img.shields.io/github/stars/YZDame/GeoGebra-Studio?style=flat)](https://github.com/YZDame/GeoGebra-Studio/stargazers)

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

## Instalación recomendada

Instala la Skill desde GitHub en un entorno compatible con Agent Skills. Como alternativa, copia **toda** la carpeta `skills/geogebra-studio/`, incluidos `SKILL.md`, `scripts/`, `references/` y `runtime/`. Copiar solo `SKILL.md` no basta. El agente necesita acceso a escritura y shell.

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

## DeepSeek Harness

DeepSeek Harness (`dsh`) carga este proyecto como Agent Skill. La `SKILL.md` publicada ya tiene el `name` en kebab-case y la `description` obligatorios; el frontmatter no cambia. `whenToUse` se omite porque el catálogo enruta por `name` y `description`. No instales este repositorio con `dsh plugin add`. Ese comando añade un plugin de interfaz, y este proyecto no incluye un plugin de barra lateral para DeepSeek Harness.

Usa el mismo instalador que los demás clientes. En el modo predeterminado escribe una copia completa en `.agents/skills/geogebra-studio`, un directorio que DeepSeek Harness ya explora:

- Sin `-g`: `./.agents/skills/geogebra-studio` en el directorio actual. DeepSeek Harness lo descubre cuando la raíz Git de ese proyecto es el espacio de trabajo. Si el instalador pregunta el ámbito, la opción de proyecto es esta ruta.
- Con `-g`, o Global cuando pregunta: `~/.agents/skills/geogebra-studio`. DeepSeek Harness examina ese directorio en cada espacio de trabajo.

Añade `-g` para la copia en el directorio personal. Enlaces como `~/.claude/skills` o `~/.cursor/skills` son de otros clientes. DeepSeek Harness explora `~/.dsh/skills`, `~/.agents/skills` y, en el proyecto, `.dsh/skills` y `.agents/skills`. Conserva el modo predeterminado para que exista la copia en `.agents/skills`. `--copy` omite ese directorio.

Para instalar a mano, copia **toda** la carpeta `skills/geogebra-studio/`, con `SKILL.md`, `scripts/`, `references/` y `runtime/`:

- `~/.dsh/skills/geogebra-studio`
- `~/.agents/skills/geogebra-studio`

En el chat, invócala con `/geogebra-studio`.

Abrir este repositorio como espacio de trabajo de DeepSeek Harness no descubre `skills/geogebra-studio/`. La búsqueda solo mira los hijos directos de `.dsh/skills` y `.agents/skills`. Copia la carpeta completa a `.dsh/skills/geogebra-studio` o `.agents/skills/geogebra-studio` dentro del espacio de trabajo. Para una copia solo de ese espacio, prefiere `.dsh/skills/geogebra-studio`. Este repositorio no incluye esa copia ni un enlace simbólico: en Windows, Git suele extraer los enlaces simbólicos como archivos de texto, y `.agents/skills` ya es el directorio de instalación de Codex, Cursor y `npx skills`. `.agents/plugins` sigue siendo el registro opcional del marketplace de Codex.

Los requisitos son los mismos: Node.js 22.12 o superior, acceso a archivos y shell, y la vista previa HTTP cuando el cliente puede abrir una URL de loopback. GeoGebra Studio es un proyecto independiente y no está afiliado a GeoGebra.

## Codex Plugin opcional

El Plugin es un envoltorio opcional. La versión **0.6.0** está publicada en npm. Reinicia Codex después de instalarla.

```sh
npx @lydt/geogebra-studio@0.6.0 install
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
