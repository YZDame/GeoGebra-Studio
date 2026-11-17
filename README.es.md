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

**GeoGebra Studio** es una **Agent Skill** estándar (con plugins opcionales para Codex y DeepSeek Harness). En Claude Code, Codex, Cursor, DeepSeek Harness o cualquier cliente compatible con Agent Skills, dile a tu IA qué quieres dibujar —o envíale un documento o imagen de referencia— para obtener una página interactiva de GeoGebra en 2D o 3D que puedes arrastrar, editar y exportar. ¿Quieres probarlo primero? Explora la [galería interactiva en GitHub Pages](https://yzdame.github.io/GeoGebra-Studio/) directamente en tu navegador sin instalar nada.

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md)

## Inicio rápido

1. **Instala la Agent Skill** (requiere Node.js 22.12 o superior; consulta [Instalación](#instalación) más abajo para Cursor, Grok Bot, Codex o DeepSeek Harness):

   ```sh
   npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
   ```

2. **Pide a tu IA que dibuje**, o sube un documento de problema o una imagen de referencia (las opciones de subida dependen de tu cliente de IA):

   > Dibuja un triángulo y su circunferencia circunscrita. Deja que pueda arrastrar los vértices.

3. **Interactúa, edita y exporta**: Abre la página generada para arrastrar puntos y ajustar valores, o pide más cambios a la IA. **Descarga el HTML o GGB actual antes de cerrar o recargar la página para guardar tus cambios.**

| Generar | Editar | Exportar |
| --- | --- | --- |
| ![Generar una figura interactiva](docs/images/generate.gif) | ![Cambiar valores y ver actualizarse la figura](docs/images/edit.gif) | ![Elegir un formato y descargar](docs/images/export.gif) |

## Funciones

- Figuras GeoGebra en 2D y 3D con puntos arrastrables, valores ajustables, nueve familias de temas y modos claro/oscuro.
- Descarga **HTML, GGB, PNG, SVG, PDF, XML y TikZ** directamente desde la página.
- Exporta código **Asymptote** y **TSQX/Asymptote mixto** a través de la IA; consulta los [detalles de exportación](skills/geogebra-studio/references/exports.md).
- Flujo portátil basado en [`SKILL.md`](skills/geogebra-studio/SKILL.md), sin servidor MCP, backend ni base de datos.

## Instalación

Úsalo en macOS, Windows o Linux con **Node.js 22.12 o superior**. Tu cliente de IA necesita acceso a archivos y terminal. Para abrir una página generada hace falta conexión a Internet para cargar el motor oficial de GeoGebra.

**Elige uno de los siguientes métodos según tu cliente de IA:**

### 1. Instalación general como Agent Skill (recomendada)

Para Claude Code, Cursor, Codex y otros clientes compatibles con Agent Skills. Sigue las indicaciones para elegir tu cliente y el ámbito de instalación.

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

También puedes copiar toda la carpeta [`skills/geogebra-studio/`](skills/geogebra-studio/) al directorio de Skills de tu cliente, conservando todos los archivos junto a `SKILL.md`.

### 2. Instalar en Codex (plugin opcional)

Ejecuta el instalador del plugin para Codex y abre una nueva sesión de Codex.

```sh
npx @lydt/geogebra-studio@latest install
```

<img src="docs/images/cover.png" alt="Geometría espacial en 3D generada por IA con una sección transversal móvil" width="100%">

### 3. Instalar en DeepSeek Harness (lienzo interactivo lateral)

En la aplicación de escritorio, abre **Plugins → Add Plugin**, pega el nombre del paquete siguiente e instálalo. El plugin ya incluye la skill `geogebra-studio`, por lo que no necesitas instalarla por separado.

```text
dsh-geogebra-studio
```

Abre **GeoGebra Studio** desde la barra lateral izquierda para usar el lienzo interactivo junto a tu chat. Consulta la [guía del plugin](plugins/dsh-geogebra-studio/) para instalarlo desde la línea de comandos.

<img src="docs/images/dsh-right-canvas.png" alt="Elipse con sus focos, directrices y una cuerda focal ajustable en el lienzo de DeepSeek Harness" width="100%">

### 4. Instalar en Cursor

Clona este repositorio y copia el directorio del repositorio en `~/.cursor/plugins/local/geogebra-studio`. Copia los archivos; no uses un enlace simbólico. La copia debe contener `.cursor-plugin/plugin.json`. Después ejecuta Reload Window en Cursor. Hace falta Node.js 22.12 o superior.

O copia solo la carpeta [`skills/geogebra-studio/`](skills/geogebra-studio/), con `scripts/`, `runtime/`, `references/` y `examples/`, a un directorio de skills de Cursor. [Cursor carga las skills](https://cursor.com/docs/skills) desde `~/.cursor/skills/` y `~/.agents/skills/` para tu usuario, y desde `.cursor/skills/` y `.agents/skills/` dentro de un proyecto.

Pide a Cursor que dibuje una figura. La skill escribe un HTML local. Abrir esa página requiere un navegador que pueda llegar al motor oficial de GeoGebra.

### 5. Instalar en Grok Bot

Pide a Grok Bot que copie la carpeta completa [`skills/geogebra-studio/`](skills/geogebra-studio/), con `scripts/`, `runtime/`, `references/` y `examples/`, en su biblioteca de skills. Puedes decirle: «从 https://github.com/YZDame/GeoGebra-Studio 安装 geogebra-studio 技能». La máquina en la que se ejecuta necesita Node.js 22.12 o superior.

Consulta [instalación y solución de problemas](skills/geogebra-studio/references/installation.md) para más detalles.

## Recursos

[Ejemplos](examples/README.md) · [Galería interactiva](https://yzdame.github.io/GeoGebra-Studio/) · [Definición de la Skill](skills/geogebra-studio/SKILL.md) · [Desarrollo y colaboración](CONTRIBUTING.md)

Proyecto comunitario independiente, sin afiliación con GeoGebra. Licencia [GPL-2.0-or-later](LICENSE), conservando las [atribuciones MIT previas](LICENSE-MIT) y los [avisos de terceros](THIRD_PARTY_NOTICES.md).
