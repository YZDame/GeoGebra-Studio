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

把想畫的圖用文字告訴 AI，或直接傳文件、參考圖，就能產生一個可互動的 GeoGebra 頁面。支援平面和立體圖形，可以拖曳、修改，也可以匯出成其他格式。

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md)

## 使用方法

安裝後，直接向 AI 提出作圖需求，例如：

> 畫一個三角形和它的外接圓，頂點可以拖曳。

也可以上傳題目文件或參考圖，讓 AI 按照內容作圖。上傳方式取決於你使用的 AI 客戶端。

開啟產生的頁面後，可以拖曳點、調整數值，也可以繼續讓 AI 修改。

**關閉或重新整理前，請下載目前的 HTML 或 GGB，儲存你的修改。**

| 產生 | 編輯 | 匯出 |
| --- | --- | --- |
| ![產生互動圖形](docs/images/generate.gif) | ![調整數值，圖形隨之變化](docs/images/edit.gif) | ![選擇格式並下載](docs/images/export.gif) |

## 功能特性

- 平面與立體作圖，支援拖曳點和調整數值。
- 頁面內下載 **HTML、GGB、PNG、SVG、PDF、XML、TikZ**。
- 透過 AI 另行匯出 Asymptote 和混合 TSQX/Asymptote 原始碼，詳見[匯出說明](skills/geogebra-studio/references/exports.md)。

## 安裝

可在 macOS、Windows 和 Linux 上使用。需要 **Node.js 22.12 或更新版本**，AI 客戶端需支援讀寫檔案和執行指令。開啟產生的頁面時需要連網載入 GeoGebra。

### 1. 通用安裝

適用於 Codex、Claude Code、Cursor 等支援 Agent Skills 的用戶端。依提示選擇用戶端和安裝範圍。

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

也可以把整個 [`skills/geogebra-studio/`](skills/geogebra-studio/) 資料夾複製到客戶端的 Skills 目錄，保留其中的全部檔案。

### 2. 在 Codex 中安裝

執行 Codex 外掛安裝指令，然後開啟新的 Codex 工作階段。

```sh
npx @lydt/geogebra-studio@latest install
```

<img src="docs/images/cover.png" alt="用 AI 繪製帶可移動截面的立體幾何圖形" width="100%">

### 3. 在 DeepSeek Harness 中安裝

在桌面應用程式開啟 **外掛 → 新增外掛**，貼上以下套件名稱即可安裝。

```text
dsh-geogebra-studio
```

安裝後，從左側欄開啟 **GeoGebra Studio**，即可在對話旁使用互動畫布。命令列安裝請見[外掛說明](plugins/dsh-geogebra-studio/)。

<img src="docs/images/dsh-right-canvas.png" alt="DeepSeek Harness 右側畫布中的橢圓、焦點、準線與可調焦點弦" width="100%">

更多安裝細節見[安裝與疑難排解](skills/geogebra-studio/references/installation.md)。

## 相關資料

[範例](examples/README.md) · [互動範例（GitHub Pages）](https://yzdame.github.io/GeoGebra-Studio/) · [開發與貢獻](CONTRIBUTING.md)

本專案由社群獨立開發。採用 [GPL-2.0-or-later](LICENSE) 授權，保留[原 MIT 授權](LICENSE-MIT)與[第三方聲明](THIRD_PARTY_NOTICES.md)。
