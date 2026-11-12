# GeoGebra Studio

[![CI](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml) [![License: GPL-2.0-or-later](https://img.shields.io/badge/license-GPL--2.0--or--later-blue.svg)](LICENSE) [![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522.12-339933?logo=node.js)](https://nodejs.org/) [![GitHub stars](https://img.shields.io/github/stars/YZDame/GeoGebra-Studio?style=flat)](https://github.com/YZDame/GeoGebra-Studio/stargazers)

**可攜式 Agent Skill：產生、編輯與匯出互動式數學幾何圖形。** 只要描述 2D 或 3D 幾何構造，Agent 就能產生本機 GeoGebra HTML，並透過瀏覽器檢視、拖曳和編輯。

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md)

## 使用方式

<img src="docs/images/cover.png" alt="macOS 上的 Codex：使用者以中文詢問 GeoGebra Studio 能否繪製高中立體幾何，右側是帶可移動截面（高度 h）的四分之一圓柱體三維作圖。" width="100%">

| 產生 | 編輯 | 匯出 |
| --- | --- | --- |
| ![終端執行 generate / preview（含 ZoomIn），隨後本機檢視器載入完整可見外接圓的作圖。](docs/images/generate.gif) | ![代數區與圖形區同步：b 從 4→3、h 從 3→4，三角形與完整外接圓隨之更新。](docs/images/edit.gif) | ![Download 選單展開全部七種格式並點選 SVG / TikZ，隨後展示真實 TikZ 原始碼。](docs/images/export.gif) |
| 從命令 JSON 到預先適配的本機可互動檢視器。 | 改一個自由量，相依關係跟著走。 | 一次作圖，七種格式 — 真實 Download 選單。 |

## 核心功能

- 官方 GeoGebra 引擎，保留自由點、相依物件、代數檢視及 2D/3D 構造。
- 自適應畫布、九種配色主題與明暗模式；操作工具列位於畫布外側。
- 內建七種下載格式：**GGB、HTML、PNG、SVG、PDF、XML、TikZ**。
- 將目前構造的 XML 匯出為 **Asymptote** 或 **混合 TSQX/Asymptote** 原始碼。
- TikZ 使用 GeoGebra 原生 PGF，並經由隨附的 Gikz 清理。
- 日常使用不需要 MCP Server、獨立後端、資料庫或額外的 Chrome 自動化環境。

**系統需求：** Node.js 22.12 以上；開啟 HTML 時必須連網載入 GeoGebra 官方引擎。獨立 Skill 已包含必要的產生程式及資源，無須另行安裝 npm 套件。

## 安裝 Agent Skill（建議）

在支援 Agent Skills 的環境中，從 GitHub 安裝 `geogebra-studio`：

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

也可以將**整個** `skills/geogebra-studio/` 資料夾複製到 Agent 的 Skills 目錄，必須同時保留 `SKILL.md`、`references/`、`scripts/` 與 `runtime/`。請勿只複製 `SKILL.md`；複製後不需要再執行 `npm install`。

Agent 需要具備檔案寫入與終端機指令執行權限。優先使用客戶端內建瀏覽器；若不提供側邊瀏覽器，可使用一般瀏覽器。不同 Agent 對 Skill 的安裝與瀏覽器存取支援程度不一定相同。

## DeepSeek Harness

DeepSeek Harness（`dsh`）可以用兩種方式使用 GeoGebra Studio。Agent Skill 負責產生圖形。已發布的 `SKILL.md` 已包含必要的 kebab-case `name` 與 `description`，因此 frontmatter 維持原樣。未加入選用的 `whenToUse`：DeepSeek Harness 的技能目錄依 `name` 與 `description` 路由，`whenToUse` 只是提供者詮釋資料，不會顯示給模型。側邊欄按鈕是另一個套件，[`plugins/dsh-geogebra-studio/`](plugins/dsh-geogebra-studio/)。請不要對儲存庫根目錄、`@lydt/geogebra-studio` 或 `skills/geogebra-studio/` 執行 `dsh plugin add`。那些都不是側邊欄外掛。

建議使用與其他 Agent Skills 客戶端相同的安裝指令。預設模式下，`skills` CLI 會把完整 Skill 寫入 `.agents/skills/geogebra-studio`，DeepSeek Harness 已經掃描這個目錄：

- 不加 `-g` 時，指令把複本寫到目前目錄的 `./.agents/skills/geogebra-studio`。當該專案的 Git 根目錄是工作區時，DeepSeek Harness 會發現它。如果安裝程式詢問範圍，專案選項就是這條路徑。
- 加上 `-g`，或在詢問時選擇 Global，會寫到 `~/.agents/skills/geogebra-studio`。DeepSeek Harness 會在每個工作區掃描這個目錄。

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

需要使用者主目錄中的複本時加上 `-g`。安裝程式也可能把 Skill 連結到 `~/.claude/skills` 或 `~/.cursor/skills` 等客戶端目錄。DeepSeek Harness 掃描 `~/.dsh/skills`、`~/.agents/skills`，以及專案內的 `.dsh/skills` 與 `.agents/skills`。請保持預設安裝模式，以便寫入 `.agents/skills` 複本。`--copy` 會略過該目錄，只寫入所選客戶端自己的資料夾。

也可以手動把**整個** `skills/geogebra-studio/` 資料夾（含 `SKILL.md`、`scripts/`、`references/` 與 `runtime/`）複製到以下其中一個位置：

- `~/.dsh/skills/geogebra-studio`
- `~/.agents/skills/geogebra-studio`

在對話中用 `/geogebra-studio` 呼叫。

把本儲存庫當作 DeepSeek Harness 工作區開啟時，不會發現 `skills/geogebra-studio/`。發現範圍只包含 `.dsh/skills` 與 `.agents/skills` 的直接子項目。請把整個資料夾複製到工作區內的 `.dsh/skills/geogebra-studio` 或 `.agents/skills/geogebra-studio`。工作區複本優先放在 `.dsh/skills/geogebra-studio`：它只服務 DeepSeek Harness，並把 `.agents/skills` 留給 `npx skills`。本儲存庫不提交這份複本或符號連結。Windows 上的 Git 經常把符號連結取出成純文字檔，而 `.agents/skills` 已是 Codex、Cursor 與 `npx skills` 使用的安裝目錄。現有的 `.agents/plugins` 仍然只是可選的 Codex 市集記錄。

### 側邊欄按鈕

把側邊欄外掛安裝到 web profile，然後重新啟動 `dsh web`。GitHub 位址要加引號，pnpm 才會保留子目錄：

```sh
dsh plugin --profile web add "github:YZDame/GeoGebra-Studio#main&path:plugins/dsh-geogebra-studio"
```

在本儲存庫的取出目錄中：

```sh
dsh plugin --profile web add ./plugins/dsh-geogebra-studio
```

外掛向官方的 `sidebar.footer.action` 清單註冊一個入口，位於側邊欄底部、設定按鈕上方。側邊欄展開時顯示幾何圖示和 GeoGebra 標籤；收成窄軌時只顯示圖示。點選後開啟說明：如何呼叫 `/geogebra-studio`、Node.js 22.12+ 與 HTTP 預覽需求、可複製的開頭，以及非官方專案聲明。這個按鈕不會安裝 Skill，也不會畫出圖形。在 Windows 上，較舊的 `dsh` 可能把 GitHub 位址交給 `cmd.exe`，`&` 會被當成命令分隔符，結果裝上的是儲存庫根目錄。遇到這種情況請改用取出目錄。

需求與其他客戶端相同：Node.js 22.12+、檔案寫入與命令執行權限，並在客戶端能夠開啟本機網址時使用 HTTP 預覽。GeoGebra Studio 是獨立社群專案，與 GeoGebra 官方無隸屬關係。

## 可選的 Codex Plugin

Codex Plugin 為選用。可透過 npm 安裝最新發布的版本：

```sh
npx @lydt/geogebra-studio@latest install
```

安裝後請重新開啟 Codex 工作階段。原始碼開發指令為 `npm ci && npm run build`，本地 Codex 安裝則使用 `node dist/cli.js install --local`。

## 快速開始

建立 `diagram.json`：

```json
{
  "filename": "circle.html",
  "commands": ["A=(0,0)", "B=(4,0)", "c=Circle(A,B)"],
  "visibleLabels": ["A", "B"]
}
```

讓 Agent 依照 Skill 執行，或直接透過終端機：

```sh
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs generate --input /absolute/project/diagram.json --workspace /absolute/project
```

如果 Agent 客戶端能存取本機網址，Skill 預設啟動單檔 HTTP 預覽。請優先使用此方式，不要依賴 HTML 檔案預覽面板——後者可能攔截 GeoGebra 的遠端引擎腳本：

```sh
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs preview --input /absolute/project/diagram.html --workspace /absolute/project
```

Agent 在客戶端的瀏覽器側邊欄或分頁開啟傳回的網址，把 **開啟互動預覽** 連結放在回覆首位，並保持程序執行。預覽服務只提供選定 HTML 的快照，修改檔案後須重新啟動。開啟檔案預覽分頁不算瀏覽器驗證。若客戶端因安全政策拒絕存取，應停止並回報限制，不可切換傳輸方式規避。只有在目標瀏覽器確認 `window.geogebraStudio.status === "ready"` 並看到實際圖形後，才能回報繪製成功。

回覆也會另外提供 HTML 下載。若客戶端無法存取預覽網址，可下載 HTML 並用 Chrome、Safari 等一般瀏覽器直接開啟。兩種檢視方式都需要瀏覽器能連線載入 GeoGebra 官方引擎。產生 HTML 本身可以離線。

產生器只會建立新檔案，不覆寫既有檔案，也不會在產生階段執行幾何指令。必須檢視實際的 GeoGebra 畫面，確認幾何關係、交點分支、比例、標籤及拖曳效果。

## 編輯與匯出

工具列左側按鈕可展開 GeoGebra 代數檢視；右側為主題、明暗模式與下載選單。**手動編輯不會自動更新原始 JSON 或 HTML**，關閉或重新整理頁面前，請下載目前的 HTML 或 GGB。已下載的 HTML 會嵌入目前的 GGB，重新開啟可保留編輯結果。

要轉換為 TSQX 或 Asymptote，先從 Viewer 下載目前的 XML，或在頁面中執行 `await window.geogebraStudio.snapshot()` 取得 XML，再執行：

```sh
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs export --input /absolute/project/figure.xml --format tsqx --workspace /absolute/project --output figure.tsqx
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs export --input /absolute/project/figure.xml --format asymptote --workspace /absolute/project --output figure.asy
```

語意轉換只涵蓋已驗證的構造類型；遇到不支援的相依關係會明確報錯，不會偷偷固定座標。TSQX 為混合 TSQX/Asymptote，**不是純 TSQX**。TikZ 則是經 Gikz 清理的靜態視覺圖。

## 架構、測試與授權

`Agent → SKILL.md → 構造 JSON → 本機 CLI/HTML Viewer → 官方 GeoGebra 引擎 → 目前狀態匯出`

詳細指引會從 `references/` 按需載入。通用 Skill 與 Codex Plugin 共用相同來源，不提供 MCP Server。

### 展示範例

| 學段 | 規格 | 亮點 |
| --- | --- | --- |
| 國中 | [`examples/napoleon.json`](examples/napoleon.json) | 拿破崙定理：外側等邊三角形與可拖曳的內側等邊三角形 |
| 高中 | [`examples/nine-point-circle.json`](examples/nine-point-circle.json) | 九點圓與歐拉線 |
| 大學 | [`examples/hyperboloid-ruled.json`](examples/hyperboloid-ruled.json) | 單葉雙曲面與兩族直母線（3D） |
| 互動示範 | [`examples/cycloid.json`](examples/cycloid.json) | 鐘擺線：拖動滑桿滾動圓，觀察圓周上一點的軌跡 |

更多平面與三維構造見[範例目錄](examples/README.md)。

參考：[教師入門指南](docs/TEACHER-QUICKSTART.zh-CN.md)、[範例](examples/)、[架構說明](docs/MODERNIZATION.md)、[貢獻指南](CONTRIBUTING.md)。

開發驗證：`npm ci`、`npm run verify`、`npm run test:unit`。額外的真實 GeoGebra/瀏覽器測試需要 Chrome 與網路，但日常使用並不需要額外的 Chrome 安裝。

本專案與 GeoGebra 官方無隸屬關係。整體授權採 GPL-2.0-or-later；保留原有 MIT 與第三方聲明，詳見 [LICENSE](LICENSE)、[LICENSE-MIT](LICENSE-MIT)、[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
