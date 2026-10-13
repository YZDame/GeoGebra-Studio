# GeoGebra Studio

> 发布状态：`0.4.0-rc.2` 已发布到 npm，并在 macOS + Chrome 上通过匿名公共安装、全新 Codex 会话中的 MCP/图形交付和真实浏览器导出验收。正式 `0.4.0` 仍待平台及 CI 检查。请使用下面的固定候选版本；详见[发布记录](docs/RELEASE-0.4.0-rc.2.md)。

将 **MCP、agent skills、可编辑 GeoGebra HTML 查看器与内置 Gikz** 打包在一起的
本地 Codex 插件。描述几何题，获得内嵌真正 GGB 的本地 HTML，随后编辑与下载。

[English](README.md) · [视觉规范](docs/VISUAL-STANDARD.md) · [回归案例](docs/TANGENT-REGRESSION.md)

## 安装完整插件

需要 Node ≥22.12.0、npm/npx，以及支持 plugin 命令的 Codex。

```sh
npx @lydt/geogebra-studio@0.4.0-rc.2 install
```

安装器登记持久化、固定版本的 npm marketplace，通过 Codex 安装 skills 和 MCP。
优先检测并试启动现有 Chrome；没有可用版本时下载受管理的 Chromium。
不需要 GeoGebra 桌面客户端，也不需要单独安装 Gikz。
安装后开启**新会话**，引用 `@geogebra-studio` 并描述题意，例如：

> 画圆 Γ：x²+y²=25 与圆 ω：(x−3)²+y²=64/25。A 在 Γ 上运动，过 A 作 ω 的两条
> 切线，与 Γ 再交于 B、C。生成可编辑的本地 HTML，标注 O、I、A、B、C、Γ、ω。

默认工具 `geogebra_build_artifact` 执行原生构造、检查可见对象、打包 GGB，重新
打开最终 HTML 并检查等比画布，返回预览供 agent 检查。仅创建工作区内新文件，
不会覆盖已有文件。完整参数见 examples/tangent-construction.json。
保存文件时，agent 将用户项目的绝对目录传入 `workspace`；客户端也可以提供 MCP roots。
输出文件不会默认落入插件缓存目录。

## 编辑与下载

打开 HTML 后可拖动 A；左侧按钮展开原生对象栏，可修改定义与样式。
右上角有主题菜单、独立深浅色切换和下载菜单，提供九组配色。

| 格式 | 内容 |
| --- | --- |
| GGB | 原生可编辑对象、构造关系和样式 |
| HTML | GGB、交互查看器、主题和本地清洗器 |
| XML | GeoGebra 定义与样式，不是打包 GGB |
| SVG / PDF | 静态矢量图 |
| PNG | 静态位图 |
| TikZ | 原生 PGF 经 Gikz 清洗的静态源码 |

所有 TikZ 入口统一经过**原生 PGF → 内置 Gikz → .tex**；清洗失败报错，没有原始
代码回退。清洗会规范化颜色、线宽、坐标精度及标签位置；完整构造关系保存在
GGB/XML。Asymptote 与混合 TSQX/Asymptote 保留原有语义子集及 strict/partial 警告，
一般构造关系的转换仍需检查。

## 单独启动 MCP 与诊断

```sh
npx @lydt/geogebra-studio@0.4.0-rc.2 mcp
npx @lydt/geogebra-studio@0.4.0-rc.2 doctor
npx @lydt/geogebra-studio@0.4.0-rc.2 browser install
```

无参数也启动 MCP；单独运行 MCP 不会安装 skills。
PUPPETEER_EXECUTABLE_PATH 可指定 Chrome；GEOGEBRA_STUDIO_HOME 控制浏览器缓存，
CODEX_HOME 控制 Codex 持久化目录。插件配置绑定同版本 npm 包，不指向临时 npx 目录。

执行原生构造、打开 HTML 均需要联网加载 GeoGebra 官方资源；HTML 不是完整离线版
GeoGebra。Gikz 本地清洗不上传图形。加载失败会显示具体错误。
首发面向本地 Codex，不包含远程 HTTPS 服务或 ChatGPT 公共目录上架。

## 开发、验收与迁移

```sh
npm ci --ignore-scripts
npm run build
npm run test:unit
npm run verify
npm run verify:native
```

真实引擎/浏览器检查需要 Chrome 和网络。verify-viewer.cjs 检查响应式画布、原生
对象栏编辑与七种下载；verify-gikz-mcp.cjs 检查实际 MCP TikZ 出口。
npm 和 plugin ZIP 包携带构建结果、源码及许可证，不依赖安装时编译。
未发布的开发测试可运行 `node dist/cli.js install --local`，使用独立 CODEX_HOME
隔离测试；SDK 调通或源码构建成功，均不能代替新会话中的插件加载验收。

新包替代 @lydt/geogebra-mcp-server 与 geogebra-geometry 插件，保留 geogebra_* 工具名
和 geogebra-mcp 命令别名。新插件验收后可手动删除旧插件；安装器不会自动卸载。
不再使用 GIKZ_CLI。GitHub 仓库由维护者后续改名，届时更新链接。

融合发行版采用 GPL-2.0-or-later。原 MCP 的 MIT 声明保留在 LICENSE-MIT，Gikz
源码及来源保存在 gikz/，Clipper 配色的 MIT 声明保留在 THIRD_PARTY_NOTICES.md。
本插件独立维护，并非 GeoGebra 官方产品。
