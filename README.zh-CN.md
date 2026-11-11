# GeoGebra Studio

[![CI](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml) [![License: GPL-2.0-or-later](https://img.shields.io/badge/license-GPL--2.0--or--later-blue.svg)](LICENSE) [![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522.12-339933?logo=node.js)](https://nodejs.org/) [![GitHub stars](https://img.shields.io/github/stars/YZDame/GeoGebra-Studio?style=flat)](https://github.com/YZDame/GeoGebra-Studio/stargazers)

**一个可移植的 Agent Skill，用于生成、编辑和导出交互式数学图形。** 输入二维或三维数学构造要求，Agent 生成本地 GeoGebra HTML，在浏览器中检查、拖动、编辑并导出。

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md)

## 使用方式

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

## 可选 Codex Plugin

Codex 的便捷安装命令（0.6.0）：

```sh
npx @lydt/geogebra-studio@0.6.0 install
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
| 进阶演示 | [`examples/calabi-yau.json`](examples/calabi-yau.json) | 费马五次超曲面投影的卡拉比–丘示意（可视化，非 Ricci-flat 度量） |

相关资料：[教师教程](docs/TEACHER-QUICKSTART.zh-CN.md)、[示例](examples/)、[架构](docs/MODERNIZATION.md)、[贡献说明](CONTRIBUTING.md)。

开发运行 `npm ci`、`npm run verify`、`npm run test:unit`。可选的真实引擎/浏览器测试需要 Chrome 和网络；日常使用不需要它们。

本项目与 GeoGebra 官方无隶属关系。整体采用 GPL-2.0-or-later；保留原 MIT 与第三方声明，详见 [LICENSE](LICENSE)、[LICENSE-MIT](LICENSE-MIT)、[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
