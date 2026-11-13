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

**Uma Agent Skill portátil para criar, editar e exportar construções matemáticas interativas com GeoGebra.**

## Como funciona

| Gerar | Editar | Exportar |
| --- | --- | --- |
| ![O terminal executa generate e preview (com ZoomIn); o visualizador local carrega o triângulo retângulo com a circunferência circunscrita inteira visível.](docs/images/generate.gif) | ![Na vista Álgebra, b vai de 4 para 3 e depois h de 3 para 4; o triângulo e a circunferência completa atualizam na hora.](docs/images/edit.gif) | ![Menu Download com GGB, PNG, SVG, TikZ, PDF, XML e HTML; cliques em SVG e TikZ, depois o código TikZ exportado.](docs/images/export.gif) |
| Do JSON de comandos ao visualizador local interativo já enquadrado. | Altere um valor livre. Os objetos dependentes mantêm as relações. | Uma construção. Sete formatos no menu Download real. |

## Recursos

- Figuras nativas e editáveis em 2D/3D, com objetos dependentes e visualização algébrica.
- Visualizador responsivo, nove famílias de temas e modos claro/escuro.
- Sete downloads pelo visualizador: **GGB, HTML, PNG, SVG, PDF, XML e TikZ**.
- Exportação local adicional de XML para **Asymptote** e **TSQX/Asymptote misto**.
- O uso normal não exige servidor MCP, backend ou banco de dados.

## Requisitos

Node.js **22.12 ou superior**. É necessário acesso à Internet ao abrir o HTML gerado, pois o mecanismo oficial do GeoGebra é carregado remotamente.

## Instalação

### 1. Instalação geral

Para Codex, Claude Code, Cursor e outros clientes compatíveis com Agent Skills. Siga as instruções para escolher o cliente e o escopo da instalação.

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

### 2. Instalação no Codex

Execute o instalador e abra uma nova sessão do Codex.

```sh
npx @lydt/geogebra-studio@latest install
```

<img src="docs/images/cover.png" alt="Codex no macOS: uma pergunta em chinês se o GeoGebra Studio desenha geometria espacial do ensino médio em 3D, ao lado de um quarto de cilindro com uma seção móvel na altura h." width="100%">

### 3. Instalação no DeepSeek Harness

No aplicativo de desktop, abra **Plugins → Add Plugin**, cole o nome do pacote e instale-o.

```text
dsh-geogebra-studio
```

Abra o **GeoGebra Studio** na barra lateral esquerda. O [guia do plugin](plugins/dsh-geogebra-studio/) também explica a instalação pelo terminal.

<img src="docs/images/dsh-right-canvas.png" alt="Elipse com corda focal ajustável no DeepSeek Harness" width="100%">

## Início rápido

Crie `diagram.json` e peça ao agente para usar a Skill ou execute o gerador local:

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

## Editar e salvar

Abra o HTML em um navegador moderno. Arraste pontos livres ou edite os objetos na visualização algébrica. **Baixe o HTML ou GGB atual antes de fechar ou atualizar a página**: o arquivo original não é alterado automaticamente. O HTML baixado preserva a construção editável.

## Exportação de código-fonte

Baixe o XML atual do visualizador (ou use `await window.geogebraStudio.snapshot()`) e execute os comandos abaixo. A saída TSQX é **mista com Asymptote**, e não TSQX puro. Dependências não suportadas geram erros explícitos.

```sh
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs export --input /absolute/project/figure.xml --format tsqx --workspace /absolute/project --output figure.tsqx
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs export --input /absolute/project/figure.xml --format asymptote --workspace /absolute/project --output figure.asy
```

## Desenvolvimento e verificação

```sh
npm ci
npm run verify
npm run test:unit
```

A verificação opcional em navegador real exige Chrome e Internet. A geração local cotidiana não precisa de Chrome nem de servidor MCP.

Veja também: [Galeria interativa](https://yzdame.github.io/GeoGebra-Studio/), [exemplos](examples/README.md), [arquitetura](docs/MODERNIZATION.md), [contribuições](CONTRIBUTING.md).

GeoGebra Studio é um projeto comunitário independente, sem vínculo com GeoGebra. Licença combinada **GPL-2.0-or-later**; consulte [LICENSE](LICENSE), [LICENSE-MIT](LICENSE-MIT) e os [avisos de terceiros](THIRD_PARTY_NOTICES.md).
