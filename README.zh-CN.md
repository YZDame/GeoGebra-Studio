# GeoGebra Studio

[![CI](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml) [![License: GPL-2.0-or-later](https://img.shields.io/badge/license-GPL--2.0--or--later-blue.svg)](LICENSE) [![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522.12-339933?logo=node.js)](https://nodejs.org/) [![GitHub stars](https://img.shields.io/github/stars/YZDame/GeoGebra-Studio?style=flat)](https://github.com/YZDame/GeoGebra-Studio/stargazers)

把想画的图用文字告诉 AI，或者直接发文档、参考图，就能生成一个可交互的 GeoGebra 页面。支持平面和立体图形，可以拖动、修改，也可以导出成其他格式。

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md)

<img src="docs/images/cover.png" alt="用 AI 绘制带可移动截面的立体几何图形" width="100%">

## 使用方法

安装后，直接向 AI 提出作图需求，比如：

> 画一个三角形和它的外接圆，顶点可以拖动。

也可以上传题目文档或参考图，让 AI 按照内容作图。上传方式取决于你使用的 AI 客户端。

打开生成的页面后，可以拖动点、调整数值，也可以继续让 AI 修改。

**关闭或刷新前，请下载当前 HTML 或 GGB，保存你的修改。**

| 生成 | 编辑 | 导出 |
| --- | --- | --- |
| ![生成交互图形](docs/images/generate.gif) | ![调整数值，图形随之变化](docs/images/edit.gif) | ![选择格式并下载](docs/images/export.gif) |

## 功能特性

- 平面与立体作图，支持拖动点和调整数值。
- 页面内下载 **HTML、GGB、PNG、SVG、PDF、XML、TikZ**。
- 通过 AI 另行导出 Asymptote 和混合 TSQX/Asymptote 源码，详见[导出说明](skills/geogebra-studio/references/exports.md)。

## 安装

可在 macOS、Windows 和 Linux 上使用。需要 **Node.js 22.12 或更高版本**，AI 客户端需支持读写文件和运行命令。打开生成的页面时需要联网加载 GeoGebra。

### 通用安装：支持 Agent Skills 的客户端

适用于 Codex、Claude Code、Cursor 等支持 Agent Skills 的客户端：

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

按提示选择客户端和安装范围。也可以把整个 [`skills/geogebra-studio/`](skills/geogebra-studio/) 文件夹复制到客户端的 Skills 目录，保留其中的全部文件。

### Codex 插件安装

也可以使用专门的安装命令，安装后重开 Codex 会话：

```sh
npx @lydt/geogebra-studio@latest install
```

### DeepSeek Harness

使用上面的通用安装命令；加上 `-g` 可安装到用户目录，让各个工作区都能使用。选择默认安装模式。装好后，在对话中输入 `/geogebra-studio`。

如果还想添加侧边栏按钮，见[侧边栏插件安装说明](plugins/dsh-geogebra-studio/)。先安装 Skill 即可作图，侧边栏按钮可按需另行安装。

更多安装细节见[安装与排障](skills/geogebra-studio/references/installation.md)。

## 相关资料

[示例](examples/README.md) · [教师教程](docs/TEACHER-QUICKSTART.zh-CN.md) · [开发与贡献](CONTRIBUTING.md)

本项目由社区独立开发。采用 [GPL-2.0-or-later](LICENSE) 许可，保留[原 MIT 许可](LICENSE-MIT)与[第三方声明](THIRD_PARTY_NOTICES.md)。
