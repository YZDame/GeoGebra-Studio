# GeoGebra Studio

[![CI](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml) [![License: GPL-2.0-or-later](https://img.shields.io/badge/license-GPL--2.0--or--later-blue.svg)](LICENSE) [![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522.12-339933?logo=node.js)](https://nodejs.org/) [![GitHub stars](https://img.shields.io/github/stars/YZDame/GeoGebra-Studio?style=flat)](https://github.com/YZDame/GeoGebra-Studio/stargazers)

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

## Instalação da Agent Skill (recomendado)

Em um ambiente compatível com Agent Skills, instale `geogebra-studio` pelo GitHub. Alternativamente, copie a pasta `skills/geogebra-studio/` **inteira**: `SKILL.md`, `scripts/`, `references/` e `runtime/` são obrigatórios. Copiar somente `SKILL.md` não funciona. O agente precisa de permissão para gravar arquivos e executar comandos.

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

## DeepSeek Harness

O DeepSeek Harness (`dsh`) carrega este projeto como uma Agent Skill. O `SKILL.md` publicado já tem o `name` em kebab-case e a `description` obrigatórios; o frontmatter permanece como está. `whenToUse` fica de fora porque o catálogo roteia por `name` e `description`. Não instale este repositório com `dsh plugin add`. Esse comando adiciona um plugin de interface, e este projeto não inclui um plugin de barra lateral do DeepSeek Harness.

Use o mesmo instalador dos outros clientes. No modo padrão, uma cópia completa vai para `.agents/skills/geogebra-studio`, diretório que o DeepSeek Harness já examina:

- Sem `-g`: `./.agents/skills/geogebra-studio` no diretório atual. O DeepSeek Harness a encontra quando a raiz Git desse projeto é o espaço de trabalho. Se o instalador perguntar o escopo, a opção de projeto é este caminho.
- Com `-g`, ou Global quando ele perguntar: `~/.agents/skills/geogebra-studio`. O DeepSeek Harness examina esse diretório em cada espaço de trabalho.

Use `-g` para a cópia no diretório pessoal. Links como `~/.claude/skills` ou `~/.cursor/skills` pertencem a outros clientes. O DeepSeek Harness examina `~/.dsh/skills`, `~/.agents/skills` e, no projeto, `.dsh/skills` e `.agents/skills`. Mantenha o modo padrão para gravar a cópia em `.agents/skills`. `--copy` ignora esse diretório.

Na instalação manual, copie a pasta `skills/geogebra-studio/` **inteira**, com `SKILL.md`, `scripts/`, `references/` e `runtime/`:

- `~/.dsh/skills/geogebra-studio`
- `~/.agents/skills/geogebra-studio`

No chat, invoque com `/geogebra-studio`.

Abrir este repositório como espaço de trabalho do DeepSeek Harness não descobre `skills/geogebra-studio/`. A busca lê apenas os filhos diretos de `.dsh/skills` e `.agents/skills`. Copie a pasta inteira para `.dsh/skills/geogebra-studio` ou `.agents/skills/geogebra-studio` dentro do espaço de trabalho. Para uma cópia só desse espaço, prefira `.dsh/skills/geogebra-studio`. Este repositório não inclui essa cópia nem um link simbólico: no Windows, o Git costuma materializar links simbólicos como arquivos de texto, e `.agents/skills` já é o diretório de instalação do Codex, do Cursor e do `npx skills`. `.agents/plugins` continua sendo o registro opcional do marketplace do Codex.

Os requisitos são os mesmos: Node.js 22.12 ou superior, acesso a arquivos e shell, e a pré-visualização HTTP quando o cliente consegue abrir uma URL de loopback. O GeoGebra Studio é um projeto independente e não é afiliado ao GeoGebra.

## Plugin opcional para Codex

A integração com Codex é opcional. A versão **0.6.0** está publicada no npm. Reinicie a sessão do Codex após a instalação.

```sh
npx @lydt/geogebra-studio@0.6.0 install
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
