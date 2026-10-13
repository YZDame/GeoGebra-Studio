# GeoGebra Studio

[![npm next 版本](https://img.shields.io/npm/v/%40lydt%2Fgeogebra-studio/next?label=npm%20%28next%29)](https://www.npmjs.com/package/@lydt/geogebra-studio)
[![npm 月下载量](https://img.shields.io/npm/dm/%40lydt%2Fgeogebra-studio)](https://www.npmjs.com/package/@lydt/geogebra-studio)
[![GitHub 星标](https://img.shields.io/github/stars/YZDame/GeoGebra-Studio)](https://github.com/YZDame/GeoGebra-Studio)
[![许可证](https://img.shields.io/github/license/YZDame/GeoGebra-Studio)](LICENSE)

**用文字描述几何图形，生成可编辑的 GeoGebra 图。** GeoGebra Studio 是一个 Codex 插件，可以创建本地 HTML 页面，其中的图形可以交互操作。你可以拖动点、修改对象，并将图形下载为多种格式。

[English](README.md) · [GitHub 仓库](https://github.com/YZDame/GeoGebra-Studio) · [npm 包](https://www.npmjs.com/package/@lydt/geogebra-studio)

## 安装

需要安装 [Codex](https://openai.com/codex/) 和 Node.js 22.12 或更新版本。在终端运行：

```sh
npx @lydt/geogebra-studio@0.4.0-rc.2 install
```

安装后新建一个 **Codex 对话**，直接描述你要画的图形。安装程序会优先使用电脑上已有的 Chrome；如果没有可用的 Chrome，就会为插件下载 Chromium。

> `0.4.0-rc.2` 是预览版，目前通过 npm 的 `next` 标签发布。正式版 `0.4.0` 尚在准备中。

## 试着画一个图形

例如，可以这样告诉 Codex：

> 画圆 Γ：x² + y² = 25 和圆 ω：(x − 3)² + y² = 64/25。让点 A 在 Γ 上运动，过 A 作 ω 的两条切线，并把它们与 Γ 的另一个交点标为 B、C。请在我的项目中保存为可编辑的 HTML 图形。

GeoGebra Studio 会在你的项目中生成 HTML 文件并提供预览。之后可以用浏览器打开文件继续操作。

## 编辑和导出

拖动点可以观察图形变化。点击画布旁的按钮，可以展开 GeoGebra 对象列表并修改定义或样式。右上角的按钮可以切换主题，并下载当前图形。

- **GGB**：保留可编辑的 GeoGebra 图形。
- **HTML**：将交互图形保存在一个本地文件中。
- **SVG、PDF、PNG**：适合放入文档或讲义。
- **TikZ**：导出经过清理的静态 LaTeX 图形代码。
- **XML**：保存 GeoGebra 的构造数据。

## 关于联网

绘图引擎来自 GeoGebra 官方网站，因此创建或打开交互图形时需要联网。保存的 HTML 文件在本地，但其中的 GeoGebra 并非完整离线版本。

GeoGebra Studio 是独立的社区项目，与 GeoGebra 官方无隶属关系。
