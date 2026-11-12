# GeoGebra Studio

[![CI](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml) [![License: GPL-2.0-or-later](https://img.shields.io/badge/license-GPL--2.0--or--later-blue.svg)](LICENSE) [![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522.12-339933?logo=node.js)](https://nodejs.org/) [![GitHub stars](https://img.shields.io/github/stars/YZDame/GeoGebra-Studio?style=flat)](https://github.com/YZDame/GeoGebra-Studio/stargazers)

**一个可移植的 Agent Skill，用于生成、编辑和导出交互式数学图形。** 输入二维或三维数学构造要求，Agent 生成本地 GeoGebra HTML，在浏览器中检查、拖动、编辑并导出。

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md)

## 使用方式

<img src="docs/images/cover.png" alt="macOS 上的 Codex：用户用中文询问 GeoGebra Studio 能否绘制高中立体几何，右侧是带可移动截面（高度 h）的四分之一圆柱体三维作图。" width="100%">

| 生成 | 编辑 | 导出 |
| --- | --- | --- |
| ![终端执行 generate / preview（含 ZoomIn），随后本地查看器加载完整可见外接圆的作图。](docs/images/generate.gif) | ![代数区与图形区同步：b 从 4→3、h 从 3→4，三角形与完整外接圆随之更新。](docs/images/edit.gif) | ![Download 菜单展开全部七种格式并点击 SVG / TikZ，随后展示真实 TikZ 源码。](docs/images/export.gif) |
| 从命令 JSON 到预适配的本地可交互查看器。 | 改一个自由量，依赖关系跟着走。 | 一次作图，七种格式 — 真实 Download 菜单。 |

## 核心功能

- 使用 GeoGebra 原生引擎，支持自由点、依赖关系、对象栏编辑以及 2D/3D 构造。
- 自适应交互画布、九组主题与明暗模式；工具栏位于画布外侧。
- 页面内提供七种下载：**GGB、HTML、PNG、SVG、PDF、XML、TikZ**。
- 从当前 GeoGebra XML 转换为 **Asymptote** 或 **混合 TSQX/Asymptote** 源码。
- TikZ 路径使用 GeoGebra 原生 PGF 和内置 Gikz 清理。
- 日常生成不需要 MCP Server、独立后端、数据库或 Chrome 自动化。

**环境要求：** Node.js >=22.12；打开 HTML 时需联网加载 GeoGebra 官方引擎。独立 Skill 已附带生成脚本，无需单独安装 npm 运行包。

## 通用 Agent Skills 安装（推荐）

在支持 Agent Skills 的环境中，从 GitHub 选择安装 `geogebra-studio`：

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

也可以将整个 `skills/geogebra-studio/` 目录复制到客户端的 Skills 目录。必须同时包含 `SKILL.md`、`scripts/`、`references/` 和 `runtime/`；**不能只复制 SKILL.md**。本地生成器已随 Skill 打包，不需要在 Skill 目录运行 `npm install`。

Agent 需具有文件写入与命令执行权限。优先使用客户端内置浏览器，没有时使用普通浏览器。并非所有 Agent 客户端都提供侧边浏览器，也不代表它们的原生插件安装方式完全相同。

## DeepSeek Harness

DeepSeek Harness（`dsh`）可以按两种方式使用 GeoGebra Studio：其他客户端安装通用 Agent Skill；DeepSeek Harness 直接安装完整插件，插件同时提供工具和 Skill。已发布的 `SKILL.md` 已包含所需的 kebab-case `name` 和 `description`，因此 frontmatter 保持原样。插件是独立包，位于 [`plugins/dsh-geogebra-studio/`](plugins/dsh-geogebra-studio/)；请不要对仓库根目录、`@lydt/geogebra-studio` 或 `skills/geogebra-studio/` 执行 `dsh plugin add`。

推荐使用与其他 Agent Skills 客户端相同的安装命令。默认模式下，`skills` CLI 会把完整 Skill 写到 `.agents/skills/geogebra-studio`，DeepSeek Harness 已经扫描这个目录：

- 不加 `-g` 时，命令把副本写到当前目录的 `./.agents/skills/geogebra-studio`。当该项目的 Git 根目录是工作区时，DeepSeek Harness 会发现它。如果安装程序询问范围，项目选项就是这条路径。
- 加上 `-g`，或在询问时选择 Global，会写到 `~/.agents/skills/geogebra-studio`。DeepSeek Harness 会在每个工作区扫描这个目录。

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

需要用户主目录中的副本时加上 `-g`。安装程序也可能把 Skill 链接到 `~/.claude/skills` 或 `~/.cursor/skills` 等客户端目录。DeepSeek Harness 扫描 `~/.dsh/skills`、`~/.agents/skills`，以及项目内的 `.dsh/skills` 和 `.agents/skills`。请保持默认安装模式，以便写入 `.agents/skills` 副本。`--copy` 会跳过该目录，只写到所选客户端自己的文件夹。

也可以手动把**整个** `skills/geogebra-studio/` 目录（含 `SKILL.md`、`scripts/`、`references/` 和 `runtime/`）复制到以下任一位置：

- `~/.dsh/skills/geogebra-studio`
- `~/.agents/skills/geogebra-studio`

在对话中用 `/geogebra-studio` 调用。

把本仓库当作 DeepSeek Harness 工作区打开时，不会发现 `skills/geogebra-studio/`。发现范围只包括 `.dsh/skills` 和 `.agents/skills` 的直接子项。请把整个目录复制到工作区内的 `.dsh/skills/geogebra-studio` 或 `.agents/skills/geogebra-studio`。工作区副本优先放在 `.dsh/skills/geogebra-studio`：它只服务于 DeepSeek Harness，并把 `.agents/skills` 留给 `npx skills`。本仓库不提交这份副本或符号链接。Windows 上的 Git 经常把符号链接检出成纯文本文件，而 `.agents/skills` 已是 Codex、Cursor 和 `npx skills` 使用的安装目录。现有的 `.agents/plugins` 仍然只是可选 Codex 市场记录。

### 插件：工具、Skill 与侧边栏面板

把插件安装到 profile，然后重启 `dsh web` 或 Desktop 应用。npm 安装规格很短，不需要引号，也不需要仓库路径：

```sh
dsh plugin --profile web add dsh-geogebra-studio
```

Desktop 应用请用 `--profile desktop`。测试某个分支时，从检出目录安装：

```sh
dsh plugin --profile web add ./plugins/dsh-geogebra-studio
```

已推送的分支仍可用 GitHub 形式：
`dsh plugin --profile web add "github:YZDame/GeoGebra-Studio#main&path:plugins/dsh-geogebra-studio"`。

现在这个包会直接完成工作，而不只是打开说明：

- `geogebra_build` 按 JSON 规格生成新的可编辑 HTML 图形。
- `geogebra_preview` 用本机地址提供该文件，并返回可放进回复的链接。
- `geogebra_export` 从 GeoGebra XML 导出严格语义的 TSQX/Asymptote，或从原生 PGF 清理出 TikZ。
- 自动注册 `geogebra-studio` Skill，在 DeepSeek Harness 中无需再运行 `npx skills add`。
- **Plugins** 页面显示插件的标题、说明和图标；侧边栏底部（设置上方）的 **GeoGebra** 按钮打开快速开始面板，列出工具和一条可直接复制的开头。

在对话中直接提出需求：

> 画一个过三点的圆，打开预览，再导出 TikZ。

生成过程离线完成，且只新建文件。渲染需联网加载 GeoGebra 官方引擎；插件无法观察画布，除非用户确认图形，否则应报告未做视觉验证。查看器中的编辑不会写回磁盘：**离开前下载当前 HTML 或 GGB。** 插件自带运行时，不需要 MCP Server、后端、Chrome 配置或额外复制 Skill。

在 Windows 上，较旧的 `dsh` 可能把 GitHub 地址交给 `cmd.exe`，`&` 会被当成命令分隔符，结果装上的是仓库根目录。遇到这种情况请改用检出目录。GeoGebra Studio 是独立社区项目，与 GeoGebra 官方无隶属关系。

## 可选 Codex Plugin

可通过 npm 安装最新发布的 Codex Plugin：

```sh
npx @lydt/geogebra-studio@latest install
```

安装后重开 Codex 会话。源码开发用 `npm ci && npm run build`，再执行 `node dist/cli.js install --local`。

## 快速开始

在工作目录新建 `diagram.json`：

```json
{
  "filename": "circle.html",
  "commands": ["A=(0,0)", "B=(4,0)", "c=Circle(A,B)"],
  "visibleLabels": ["A", "B"]
}
```

让 Agent 按已安装的 Skill 执行，或直接运行：

```sh
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs generate --input /absolute/project/diagram.json --workspace /absolute/project
```

如果 Agent 客户端能访问本机地址，Skill 默认启动单文件 HTTP 预览。请优先使用该方式，不要依赖 HTML 文件预览面板——后者可能拦截 GeoGebra 的远程引擎脚本：

```sh
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs preview --input /absolute/project/diagram.html --workspace /absolute/project
```

Agent 在客户端的浏览器侧栏或标签页打开返回的地址，把 **打开交互预览** 链接放在回复首位，并保持进程运行。预览服务仅提供选定 HTML 的快照，修改文件后需重启。打开文件预览标签不算浏览器验证。若客户端因安全策略拒绝访问，应停止并报告限制，不能切换传输方式规避。只有在目标浏览器确认 `window.geogebraStudio.status === "ready"` 并看到实际图形后，才能报告渲染成功。

回复也会单独提供 HTML 下载。若客户端无法访问预览地址，可下载 HTML 并用 Chrome、Safari 等普通浏览器直接打开。两种查看方式都需要浏览器能联网加载 GeoGebra 官方引擎。生成 HTML 本身可以离线。

生成器**只写入新文件**，不会覆盖已有文件，也不代表已实际验证数学图形。需要在真实 GeoGebra 画布中检查标签、交点、切线、比例和拖动效果。

## 编辑与保存

画布外工具栏左侧展开对象栏，右侧选择主题、明暗模式和下载格式。拖动或编辑只改变当前页面，不会自动写回原 JSON/HTML。**关闭或刷新前下载当前 HTML 或 GGB。** 当前 HTML 内嵌打包 GGB，重新打开可保留编辑结果。

## TSQX / Asymptote 导出

先从 Viewer 下载当前 XML，或在页面中读取 `await window.geogebraStudio.snapshot()`，再运行：

```sh
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs export --input /absolute/project/figure.xml --format tsqx --workspace /absolute/project --output figure.tsqx
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs export --input /absolute/project/figure.xml --format asymptote --workspace /absolute/project --output figure.asy
```

语义转换只支持明确列出的构造关系，遇到不支持的依赖会报错，不会暗中固定坐标。TSQX 结果是**混合 TSQX/Asymptote**，不是纯 TSQX。TikZ 是 GeoGebra PGF 经 Gikz 清理后的静态图形。

## 架构和验证

`Agent → SKILL.md → 构造 JSON → Skill 自带 CLI/HTML Viewer → GeoGebra 官方引擎 → 当前文件导出`

Skill 中的 `references/` 按需加载构造、导出、设计和排障规则。通用 Skill 与 Codex Plugin 共用源码，不提供 MCP 服务。

### 展示示例

| 学段 | 规格 | 亮点 |
| --- | --- | --- |
| 初中 | [`examples/napoleon.json`](examples/napoleon.json) | 拿破仑定理：外侧等边三角形与可拖动的内侧等边三角形 |
| 高中 | [`examples/nine-point-circle.json`](examples/nine-point-circle.json) | 九点圆与欧拉线 |
| 大学 | [`examples/hyperboloid-ruled.json`](examples/hyperboloid-ruled.json) | 单叶双曲面与两族直母线（3D） |
| 交互演示 | [`examples/cycloid.json`](examples/cycloid.json) | 钟摆线：拖动滑块滚动圆，观察圆周上一点的轨迹 |

更多平面和三维构造见[示例目录](examples/README.md)。

相关资料：[教师教程](docs/TEACHER-QUICKSTART.zh-CN.md)、[示例](examples/)、[架构](docs/MODERNIZATION.md)、[贡献说明](CONTRIBUTING.md)。

开发运行 `npm ci`、`npm run verify`、`npm run test:unit`。可选的真实引擎/浏览器测试需要 Chrome 和网络；日常使用不需要它们。

本项目与 GeoGebra 官方无隶属关系。整体采用 GPL-2.0-or-later；保留原 MIT 与第三方声明，详见 [LICENSE](LICENSE)、[LICENSE-MIT](LICENSE-MIT)、[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
