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

**GeoGebra Studio**는 표준 **Agent Skill**입니다(Codex 및 DeepSeek Harness용 선택형 플러그인도 함께 제공합니다). Claude Code, Codex, Cursor, DeepSeek Harness 등 Agent Skills를 지원하는 AI 클라이언트에서 원하는 도형을 글로 설명하거나 문제 문서·참고 이미지를 전달하면, 점을 드래그하고 값을 조절하며 여러 형식으로 내보낼 수 있는 대화형 2D/3D GeoGebra 페이지를 만들어 줍니다. 먼저 둘러보고 싶다면 별도 설치 없이 브라우저에서 [대화형 갤러리(GitHub Pages)](https://yzdame.github.io/GeoGebra-Studio/)를 바로 체험해 보세요.

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md)

## 빠른 시작

1. **Agent Skill 설치** (Node.js 22.12 이상 필요; Cursor, Codex 및 DeepSeek Harness 플러그인 설치는 아래 [설치](#설치)를 참고하세요):

   ```sh
   npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
   ```

2. **AI에게 작도 요청하기**, 또는 문제 문서나 참고 이미지 업로드하기(업로드 방식은 사용 중인 AI 클라이언트에 따라 다릅니다):

   > 삼각형과 그 외접원을 그려 줘. 꼭짓점을 드래그할 수 있게 해 줘.

3. **조작, 수정 및 내보내기**: 생성된 페이지를 열어 점을 드래그하고 값을 바꾸거나, AI에게 추가 수정을 요청하세요. **페이지를 닫거나 새로고침하기 전에 현재 HTML 또는 GGB를 다운로드해야 편집 내용이 저장됩니다.**

| 생성 | 편집 | 내보내기 |
| --- | --- | --- |
| ![대화형 도형 생성](docs/images/generate.gif) | ![값을 바꾸면 도형이 즉시 갱신됨](docs/images/edit.gif) | ![형식을 선택해 다운로드](docs/images/export.gif) |

## 주요 기능

- 드래그 가능한 점, 조절 가능한 값, 9가지 테마, 라이트/다크 모드를 갖춘 2D 및 3D GeoGebra 도형.
- 페이지에서 **HTML, GGB, PNG, SVG, PDF, XML, TikZ** 형식으로 바로 다운로드.
- AI를 통해 **Asymptote** 및 **TSQX/Asymptote 혼합** 소스 코드 내보내기([내보내기 안내](skills/geogebra-studio/references/exports.md) 참고).
- MCP 서버, 별도 백엔드, 데이터베이스가 필요 없는 이식 가능한 [`SKILL.md`](skills/geogebra-studio/SKILL.md) 워크플로.

## 설치

macOS, Windows, Linux에서 **Node.js 22.12 이상**이 필요합니다. AI 클라이언트는 파일 읽기/쓰기 및 명령 실행 권한이 있어야 하며, 생성된 페이지를 열 때는 공식 GeoGebra 엔진을 불러오기 위해 인터넷 연결이 필요합니다.

**사용 중인 AI 클라이언트에 따라 아래 방법 중 하나를 선택해 설치하세요:**

### 1. 일반 Agent Skill 설치 (권장)

Claude Code, Cursor, Codex 등 Agent Skills를 지원하는 클라이언트에서 사용할 수 있습니다. 안내에 따라 클라이언트와 설치 범위를 선택하세요.

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

또는 [`skills/geogebra-studio/`](skills/geogebra-studio/) 폴더 전체(`SKILL.md`와 같은 폴더 내 모든 파일 포함)를 클라이언트의 Skills 디렉터리에 그대로 복사해도 됩니다.

### 2. Codex에 설치 (선택형 플러그인)

Codex 플러그인 설치 명령을 실행한 뒤 새 Codex 세션을 여세요.

```sh
npx @lydt/geogebra-studio@latest install
```

<img src="docs/images/cover.png" alt="이동 가능한 단면이 있는 AI 생성 3D 입체 기하 도형" width="100%">

### 3. DeepSeek Harness에 설치 (오른쪽 대화형 캔버스 포함)

데스크톱 앱에서 **Plugins → Add Plugin**을 열고 아래 패키지 이름을 붙여 넣어 설치하세요. 이 플러그인에는 `geogebra-studio` 스킬이 이미 포함되어 있으므로 별도로 스킬을 설치할 필요가 없습니다.

```text
dsh-geogebra-studio
```

왼쪽 사이드바에서 **GeoGebra Studio**를 열면 대화창 옆에서 대화형 캔버스를 바로 사용할 수 있습니다. 명령줄 설치는 [플러그인 안내](plugins/dsh-geogebra-studio/)를 참고하세요.

<img src="docs/images/dsh-right-canvas.png" alt="DeepSeek Harness 캔버스에 표시된 타원, 초점, 준선 및 조절 가능한 초점 현" width="100%">

### 4. Cursor에 설치 (플러그인)

마켓에 등록된 뒤에는 Cursor Marketplace에서 **GeoGebra Studio**를 설치합니다. 그 전에는 이 저장소를 `~/.cursor/plugins/local/geogebra-studio`에 복사해 `.cursor-plugin/plugin.json`이 포함되게 한 다음 Cursor를 다시 불러옵니다. Node.js 22.12 이상이 필요합니다. Cursor에게 도형을 그리게 하면 포함된 `geogebra-studio` 스킬이 로컬 HTML을 씁니다. 그 페이지를 열려면 공식 GeoGebra 엔진에 접속할 수 있는 브라우저가 필요합니다.

1절의 Agent Skill 설치도 Cursor에서 그대로 사용할 수 있습니다.

자세한 설치 방법과 문제 해결은 [설치 및 문제 해결](skills/geogebra-studio/references/installation.md)을 참고하세요.

## 관련 자료

[예제](examples/README.md) · [대화형 갤러리](https://yzdame.github.io/GeoGebra-Studio/) · [Skill 정의](skills/geogebra-studio/SKILL.md) · [개발 및 기여](CONTRIBUTING.md)

GeoGebra 공식 프로젝트와 무관한 독립 커뮤니티 프로젝트입니다. [GPL-2.0-or-later](LICENSE) 라이선스를 따르며, [기존 MIT 고지](LICENSE-MIT)와 [제3자 고지](THIRD_PARTY_NOTICES.md)를 보존합니다.
