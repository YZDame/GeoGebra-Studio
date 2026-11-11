# GeoGebra Studio

[![CI](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml) [![License: GPL-2.0-or-later](https://img.shields.io/badge/license-GPL--2.0--or--later-blue.svg)](LICENSE) [![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522.12-339933?logo=node.js)](https://nodejs.org/) [![GitHub stars](https://img.shields.io/github/stars/YZDame/GeoGebra-Studio?style=flat)](https://github.com/YZDame/GeoGebra-Studio/stargazers)

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md)

**편집 가능한 GeoGebra 수학 도형을 생성, 수정, 내보내기 위한 이식 가능한 Agent Skill입니다.**

## 사용 방법

| 생성 | 편집 | 내보내기 |
| --- | --- | --- |
| ![터미널에서 generate / preview(ZoomIn 포함)를 실행한 뒤, 외접원 전체가 보이는 직각삼각형을 로컬 뷰어에 불러온다.](docs/images/generate.gif) | ![대수 보기에서 b를 4→3, 이어서 h를 3→4로 바꾸면 삼각형과 외접원 전체가 바로 갱신된다.](docs/images/edit.gif) | ![Download 메뉴에 GGB, PNG, SVG, TikZ, PDF, XML, HTML이 보이고, SVG와 TikZ를 누른 뒤 내보낸 TikZ 소스가 나타난다.](docs/images/export.gif) |
| 명령 JSON에서 미리 맞춰 둔 로컬 대화형 뷰어로. | 자유 값을 바꿔도 종속 객체는 관계를 유지한다. | 하나의 작도. 실제 Download 메뉴의 일곱 가지 형식. |

## 주요 기능

- GeoGebra 공식 엔진을 사용하는 편집 가능한 2D/3D 도형, 종속 객체 및 대수 보기.
- 반응형 뷰어, 아홉 가지 테마 계열, 라이트/다크 모드.
- 뷰어에서 **GGB, HTML, PNG, SVG, PDF, XML, TikZ** 일곱 가지 형식 다운로드.
- XML을 **Asymptote** 또는 **TSQX/Asymptote 혼합 형식**으로 로컬 변환.
- 일반적인 사용에는 MCP 서버, 별도 백엔드 및 데이터베이스가 필요하지 않습니다.

## 요구 사항

Node.js **22.12 이상**. 생성된 HTML을 열 때 GeoGebra 공식 엔진을 온라인으로 불러오므로 인터넷 연결이 필요합니다.

## Agent Skill 설치(권장)

Agent Skills를 지원하는 환경에서 GitHub의 `geogebra-studio`를 설치합니다. 또는 `skills/geogebra-studio/` 폴더 **전체**를 복사하세요. `SKILL.md`, `scripts/`, `references/`, `runtime/`가 모두 필요하며, `SKILL.md`만 복사하면 실행되지 않습니다. 에이전트에 파일 쓰기 및 명령 실행 권한이 필요합니다.

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

## DeepSeek Harness

DeepSeek Harness(`dsh`)는 이 프로젝트를 Agent Skill로 불러옵니다. 게시된 `SKILL.md`에는 필요한 kebab-case `name`과 `description`이 이미 있으므로 frontmatter는 그대로 둡니다. 카탈로그는 `name`과 `description`으로 라우팅하므로 선택 항목 `whenToUse`는 넣지 않습니다. 이 저장소를 `dsh plugin add`로 설치하지 마세요. 그 명령은 UI 플러그인을 추가하며, 이 프로젝트에는 DeepSeek Harness 사이드바 플러그인이 없습니다.

다른 클라이언트와 같은 설치 명령을 사용합니다. 기본 모드에서는 전체 사본을 `.agents/skills/geogebra-studio`에 쓰며, DeepSeek Harness는 이 디렉터리를 이미 탐색합니다.

- `-g` 없이: 현재 디렉터리의 `./.agents/skills/geogebra-studio`. 그 프로젝트의 Git 루트가 작업 공간이면 발견됩니다. 설치 프로그램이 범위를 물으면 프로젝트 선택이 이 경로입니다.
- `-g`를 붙이거나, 물을 때 Global을 고르면 `~/.agents/skills/geogebra-studio`에 씁니다. DeepSeek Harness는 모든 작업 공간에서 이 디렉터리를 탐색합니다.

홈 디렉터리 사본이 필요하면 `-g`를 붙입니다. `~/.claude/skills`나 `~/.cursor/skills` 같은 링크는 해당 클라이언트용입니다. DeepSeek Harness는 `~/.dsh/skills`, `~/.agents/skills`, 그리고 프로젝트의 `.dsh/skills`와 `.agents/skills`를 탐색합니다. `.agents/skills` 사본이 생기도록 기본 설치 모드를 유지하세요. `--copy`는 그 디렉터리를 건너뜁니다.

수동 설치는 `skills/geogebra-studio/` 폴더 전체(`SKILL.md`, `scripts/`, `references/`, `runtime/`)를 다음 중 한곳에 복사합니다.

- `~/.dsh/skills/geogebra-studio`
- `~/.agents/skills/geogebra-studio`

채팅에서는 `/geogebra-studio`로 호출합니다.

이 저장소를 DeepSeek Harness 작업 공간으로 열면 `skills/geogebra-studio/`는 자동으로 발견되지 않습니다. 탐색은 `.dsh/skills`와 `.agents/skills`의 바로 아래 항목만 봅니다. 폴더 전체를 작업 공간의 `.dsh/skills/geogebra-studio` 또는 `.agents/skills/geogebra-studio`에 복사하세요. 작업 공간 전용 사본은 `.dsh/skills/geogebra-studio`를 우선합니다. 이 저장소는 그 사본이나 심볼릭 링크를 포함하지 않습니다. Windows의 Git은 심볼릭 링크를 종종 일반 텍스트 파일로 받고, `.agents/skills`는 Codex, Cursor, `npx skills`가 이미 쓰는 설치 경로입니다. `.agents/plugins`는 선택적 Codex 마켓플레이스 기록으로 남습니다.

요구 사항은 다른 클라이언트와 같습니다. Node.js 22.12 이상, 파일 및 셸 접근, 그리고 클라이언트가 루프백 URL을 열 수 있을 때는 HTTP 미리보기입니다. GeoGebra Studio는 독립 프로젝트이며 GeoGebra와 제휴하지 않습니다.

## 선택 사항: Codex Plugin

Codex용 배포 방식은 선택 사항입니다. **0.6.0** 버전은 npm에 게시되어 있습니다. 설치 후 Codex 세션을 다시 시작해야 합니다.

```sh
npx @lydt/geogebra-studio@0.6.0 install
```

## 빠른 시작

`diagram.json`을 만들고 에이전트에 Skill 사용을 요청하거나 아래 로컬 생성 명령을 실행하세요.

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

## 편집 및 저장

생성된 HTML을 브라우저에서 열어 자유점을 드래그하거나 대수 보기에서 객체를 수정할 수 있습니다. **닫거나 새로고침하기 전에 현재 HTML 또는 GGB를 다운로드하세요.** 원본 파일은 자동으로 갱신되지 않습니다. 다운로드한 HTML에는 편집 가능한 도형이 저장됩니다.

## 소스 코드 내보내기

뷰어에서 현재 XML을 다운로드하거나 `await window.geogebraStudio.snapshot()`을 호출한 뒤 다음 명령을 사용하세요. TSQX 결과는 순수 TSQX가 아닌 **TSQX/Asymptote 혼합 형식**입니다. 지원하지 않는 종속 관계는 명시적으로 오류를 발생시킵니다.

```sh
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs export --input /absolute/project/figure.xml --format tsqx --workspace /absolute/project --output figure.tsqx
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs export --input /absolute/project/figure.xml --format asymptote --workspace /absolute/project --output figure.asy
```

## 개발 및 검증

```sh
npm ci
npm run verify
npm run test:unit
```

선택적인 실제 브라우저 검증에는 Chrome과 인터넷이 필요합니다. 일반적인 로컬 생성에는 Chrome이나 MCP 서버가 필요하지 않습니다.

관련 문서: [교사용 가이드](docs/TEACHER-QUICKSTART.md), [예제](examples/), [아키텍처](docs/MODERNIZATION.md), [기여 안내](CONTRIBUTING.md).

GeoGebra Studio는 GeoGebra 공식 프로젝트와 무관한 독립 커뮤니티 프로젝트입니다. 통합 라이선스는 **GPL-2.0-or-later**입니다. [LICENSE](LICENSE), [LICENSE-MIT](LICENSE-MIT), [제3자 고지](THIRD_PARTY_NOTICES.md)를 참조하세요.
