# GeoGebra Studio

**一個可攜式 Agent Skill，用於產生、編輯與匯出互動式數學圖形。** 输入二维或三维數學构造要求，Agent 產生本地 GeoGebra HTML，在瀏覽器中检查、拖动、編輯并匯出。

[English](README.md) · [繁體中文](README.zh-TW.md)

![GeoGebra 官方引擎渲染的直角三角形](docs/images/right-triangle.png)

## 核心功能

- 使用 GeoGebra 原生引擎，支援自由点、依赖关系、对象栏編輯以及 2D/3D 构造。
- 自适应交互画布、九组主题与明暗模式；工具列位于画布外侧。
- 頁面内提供七种下載：**GGB、HTML、PNG、SVG、PDF、XML、TikZ**。
- 从目前 GeoGebra XML 转换为 **Asymptote** 或 **混合 TSQX/Asymptote** 原始碼。
- TikZ 路径使用 GeoGebra 原生 PGF 和内置 Gikz 清理。
- 日常產生不需要 MCP Server、獨立后端、数据库或 Chrome 自动化。

**环境要求：** Node.js >=22.12；打開 HTML 时需联网加载 GeoGebra 官方引擎。獨立 Skill 已附带產生脚本，无需单独安裝 npm 运行包。

## 通用 Agent Skills 安裝（推荐）

在支援 Agent Skills 的环境中，从 GitHub 选择安裝 `geogebra-studio`：

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

也可以将整个 `skills/geogebra-studio/` 目錄复制到客户端的 Skills 目錄。必须同时包含 `SKILL.md`、`scripts/`、`references/` 和 `runtime/`；**不能只复制 SKILL.md**。本地產生器已随 Skill 打包，不需要在 Skill 目錄运行 `npm install`。

Agent 需具有檔案写入与命令執行权限。优先使用客户端内置瀏覽器，没有时使用普通瀏覽器。并非所有 Agent 客户端都提供侧边瀏覽器，也不代表它们的原生插件安裝方式完全相同。

## 可选 Codex Plugin

保留 Codex 的便捷安裝渠道（需对应 npm 版本正式发布）：

```sh
npx @lydt/geogebra-studio@0.5.0 install
```

安裝后重開 Codex 会话。原始碼開发用 `npm ci && npm run build`，再執行 `node dist/cli.js install --local`。**0.5.0 仅为拟议版本，本 PR 不发布。** 发布前应使用构建后的仓库或獨立 Skill 目錄。

## 快速開始

在工作目錄新建 `diagram.json`：

```json
{
  "filename": "circle.html",
  "commands": ["A=(0,0)", "B=(4,0)", "c=Circle(A,B)"],
  "visibleLabels": ["A", "B"]
}
```

让 Agent 按已安裝的 Skill 執行，或直接运行：

```sh
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs generate --input /absolute/project/diagram.json --workspace /absolute/project
```

在瀏覽器中打開得到的 HTML。如果内置瀏覽器不支援 `file://`，使用仅监听 `127.0.0.1` 的临时静态服务，例如 `python3 -m http.server 8765 --bind 127.0.0.1 --directory /absolute/project`。

產生器**只写入新檔案**，不会覆盖已有檔案，也不代表已实际验证數學圖形。需要在真实 GeoGebra 画布中检查标签、交点、切线、比例和拖动效果。

## 編輯与保存

画布外工具列左侧展開对象栏，右侧选择主题、明暗模式和下載格式。拖动或編輯只改变目前頁面，不会自动写回原 JSON/HTML。**關閉或刷新前下載目前 HTML 或 GGB。** 目前 HTML 内嵌打包 GGB，重新打開可保留編輯结果。

## TSQX / Asymptote 匯出

先从 Viewer 下載目前 XML，或在頁面中读取 `await window.geogebraStudio.snapshot()`，再运行：

```sh
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs export --input /absolute/project/figure.xml --format tsqx --workspace /absolute/project --output figure.tsqx
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs export --input /absolute/project/figure.xml --format asymptote --workspace /absolute/project --output figure.asy
```

语义转换只支援明确列出的构造关系，遇到不支援的依赖会报错，不会暗中固定坐标。TSQX 结果是**混合 TSQX/Asymptote**，不是纯 TSQX。TikZ 是 GeoGebra PGF 经 Gikz 清理后的静态圖形。

## 架构和验证

`Agent → SKILL.md → 构造 JSON → Skill 自带 CLI/HTML Viewer → GeoGebra 官方引擎 → 目前檔案匯出`

Skill 中的 `references/` 按需加载构造、匯出、设计和排障规则。通用 Skill 与 Codex Plugin 共用原始碼，不提供 MCP 服务。

相关资料：[教师教程](docs/TEACHER-QUICKSTART.zh-CN.md)、[示例](examples/)、[架构](docs/MODERNIZATION.md)、[贡献说明](CONTRIBUTING.md)。

開发运行 `npm ci`、`npm run verify`、`npm run test:unit`。可选的真实引擎/瀏覽器测试需要 Chrome 和网络；日常使用不需要它们。

本项目与 GeoGebra 官方无隶属关系。整体采用 GPL-2.0-or-later；保留原 MIT 与第三方声明，详见 [LICENSE](LICENSE)、[LICENSE-MIT](LICENSE-MIT)、[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
