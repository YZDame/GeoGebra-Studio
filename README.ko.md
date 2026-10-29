# GeoGebra Studio

[![CI](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml) [![License: GPL-2.0-or-later](https://img.shields.io/badge/license-GPL--2.0--or--later-blue.svg)](LICENSE) [![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522.12-339933?logo=node.js)](https://nodejs.org/) [![GitHub stars](https://img.shields.io/github/stars/YZDame/GeoGebra-Studio?style=flat)](https://github.com/YZDame/GeoGebra-Studio/stargazers)

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md)

**편집 가능한 GeoGebra 수학 도형을 생성, 수정, 내보내기 위한 이식 가능한 Agent Skill입니다.**

![GeoGebra construction](docs/images/right-triangle.png)

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

## 선택 사항: Codex Plugin

Codex용 배포 방식은 선택 사항입니다. **0.5.0** 버전은 npm에 게시되어 있습니다. 설치 후 Codex 세션을 다시 시작해야 합니다.

```sh
npx @lydt/geogebra-studio@0.5.0 install
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
