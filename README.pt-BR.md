# GeoGebra Studio

[![CI](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml) [![License: GPL-2.0-or-later](https://img.shields.io/badge/license-GPL--2.0--or--later-blue.svg)](LICENSE) [![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522.12-339933?logo=node.js)](https://nodejs.org/) [![GitHub stars](https://img.shields.io/github/stars/YZDame/GeoGebra-Studio?style=flat)](https://github.com/YZDame/GeoGebra-Studio/stargazers)

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md)

**Uma Agent Skill portátil para criar, editar e exportar construções matemáticas interativas com GeoGebra.**

![GeoGebra construction](docs/images/right-triangle.png)

## Recursos

- Figuras nativas e editáveis em 2D/3D, com objetos dependentes e visualização algébrica.
- Visualizador responsivo, nove famílias de temas e modos claro/escuro.
- Sete downloads pelo visualizador: **GGB, HTML, PNG, SVG, PDF, XML e TikZ**.
- Exportação local adicional de XML para **Asymptote** e **TSQX/Asymptote misto**.
- O uso normal não exige servidor MCP, backend ou banco de dados.

## Requisitos

Node.js **22.12 ou superior**. É necessário acesso à Internet ao abrir o HTML gerado, pois o mecanismo oficial do GeoGebra é carregado remotamente.

## Instalação da Agent Skill (recomendado)

Em um ambiente compatível com Agent Skills, instale `geogebra-studio` pelo GitHub. Alternativamente, copie a pasta `skills/geogebra-studio/` **inteira**: `SKILL.md`, `scripts/`, `references/` e `runtime/` são obrigatórios. Copiar somente `SKILL.md` não funciona. O agente precisa de permissão para gravar arquivos e executar comandos.

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

## Plugin opcional para Codex

A integração com Codex é opcional. O código do repositório está na versão **0.5.0**. Se ela ainda não estiver disponível no npm, instale a Skill pelo GitHub ou use uma compilação local. Reinicie a sessão do Codex após a instalação.

```sh
npx @lydt/geogebra-studio@0.5.0 install
```

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

Veja também: [guia para professores](docs/TEACHER-QUICKSTART.md), [exemplos](examples/), [arquitetura](docs/MODERNIZATION.md), [contribuições](CONTRIBUTING.md).

GeoGebra Studio é um projeto comunitário independente, sem vínculo com GeoGebra. Licença combinada **GPL-2.0-or-later**; consulte [LICENSE](LICENSE), [LICENSE-MIT](LICENSE-MIT) e os [avisos de terceiros](THIRD_PARTY_NOTICES.md).
