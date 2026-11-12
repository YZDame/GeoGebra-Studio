# GeoGebra Studio

[![CI](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml) [![License: GPL-2.0-or-later](https://img.shields.io/badge/license-GPL--2.0--or--later-blue.svg)](LICENSE) [![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522.12-339933?logo=node.js)](https://nodejs.org/) [![GitHub stars](https://img.shields.io/github/stars/YZDame/GeoGebra-Studio?style=flat)](https://github.com/YZDame/GeoGebra-Studio/stargazers)

把想畫的圖用文字告訴 AI，或直接傳文件、參考圖，就能產生一個可互動的 GeoGebra 頁面。支援平面和立體圖形，可以拖曳、修改，也可以匯出成其他格式。

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md)

<img src="docs/images/cover.png" alt="用 AI 繪製帶可移動截面的立體幾何圖形" width="100%">

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

### 通用安裝：支援 Agent Skills 的客戶端

適用於 Codex、Claude Code、Cursor 等支援 Agent Skills 的客戶端：

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

依照提示選擇客戶端和安裝範圍。也可以把整個 [`skills/geogebra-studio/`](skills/geogebra-studio/) 資料夾複製到客戶端的 Skills 目錄，保留其中的全部檔案。

### Codex 外掛安裝

也可以使用專用的安裝指令，安裝後重新開啟 Codex 工作階段：

```sh
npx @lydt/geogebra-studio@latest install
```

### DeepSeek Harness

安裝外掛後，重新啟動 DeepSeek Harness。

```sh
dsh plugin --profile web add dsh-geogebra-studio
```

桌面應用程式請使用 `--profile desktop`。外掛內含 `geogebra-studio` Skill，以及產生、預覽和匯出圖形的工具。在對話中輸入 `/geogebra-studio` 即可使用。詳見[外掛說明](plugins/dsh-geogebra-studio/)。

更多安裝細節見[安裝與疑難排解](skills/geogebra-studio/references/installation.md)。

## 相關資料

[範例](examples/README.md) · [教師指南](docs/TEACHER-QUICKSTART.zh-CN.md) · [開發與貢獻](CONTRIBUTING.md)

本專案由社群獨立開發。採用 [GPL-2.0-or-later](LICENSE) 授權，保留[原 MIT 授權](LICENSE-MIT)與[第三方聲明](THIRD_PARTY_NOTICES.md)。
