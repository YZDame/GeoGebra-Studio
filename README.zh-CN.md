# GeoGebra MCP 与几何导出插件

本项目通过 MCP 调用 GeoGebra，生成可编辑的图形与出版用源码。
完整配置见 [English README](README.md)，改造依据见 [审计记录](docs/MODERNIZATION.md)。

需要 Node >=22.12.0。源码安装：`npm ci`、`npm run build`，启动：`node dist/cli.js`。
直接导出需要 Chromium；可用 `npx puppeteer browsers install chrome` 安装，或用
`PUPPETEER_EXECUTABLE_PATH` 指定已有 Chrome。

## 两种作图方式

- `geogebra_create_html`：提供 GeoGebra 命令数组，直接生成 HTML，生成时不启动浏览器。
  用户打开页面后加载 GeoGebra，可拖动点，再下载当前状态的 GGB、PNG、SVG、PDF、XML 或 HTML。
  页面依赖 GeoGebra 网络资源，不能当作离线 GeoGebra 安装包。
- 服务端作图：清空构造，批量执行命令，再通过原有工具导出。
  GGB 使用官方异步 `getBase64`，SVG/PDF 使用原生回调，保留 LaTeX 标签和小点、细线默认设置。
  自动缩放保持坐标轴等比例，并等待缩放动画完成。

## 保留图形语义的导出

`geogebra_get_semantic_scene` 提取原始 XML、命令输入输出、坐标与样式。
`geogebra_export_source` 支持 TikZ、Asymptote 和混合 TSQX/Asymptote。
当前实现覆盖自由点、两点中点、线段、多边形、圆心加圆上一点以及三点圆。
中点等从属对象保留依赖表达式。

默认严格模式拒绝不支持的定义。`strict=false` 可输出草稿，并明确列出省略对象、
退回坐标的对象以及样式警告。标签位置、部分点型和线型不保证与原图一致。
复杂交点、切线、一般圆锥曲线和轨迹等，可由插件内的 `geometry-export` skill
结合原始定义辅助重建。TSQX 内含 Asymptote 注入时，明确标为混合流程。

## Gikz

`geogebra_clean_tikz` 调用单独安装的 Gikz，支持 TikZ 清洗与 XML 转换。
设置 `GIKZ_CLI` 为其 `gikz.js` 的绝对路径。Gikz 带有 GPL 上游代码，项目没有把它复制到
MIT 本体中。清洗后的坐标图不能直接视为保留全部几何依赖。

## 插件与协议边界

仓库包含标准 `plugin.json`、`mcp.json`，以及 Codex 兼容配置和三个 skills。
插件默认使用 16 个工具的 core profile；原有客户端不设置 profile 时仍可访问全部 50 个工具。
HTML 工具提供 MCP Apps 标准 UI 资源；真实 ChatGPT 沙箱内仍需另行安装验证。

本项目采用官方 MCP SDK 1.32.1，实际协商版本最高为 2025-11-25。
审计时官网最新规范为 2026-07-28，已大幅改变握手与请求模型，本项目没有把日期字符串
改成新版本来宣称兼容。迁移差异已记录，需配合支持新规范的 SDK 继续升级。

`--port 8787` 提供仅绑定本机的 Streamable HTTP。公开接入 OpenAI 还需要 HTTPS、鉴权、
用户隔离与平台验证。此源码改造不等于发布插件目录、部署远程服务或发布 npm 包。
