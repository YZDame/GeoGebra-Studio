# GeoGebra Studio

描述数学问题，让 Codex 生成可编辑的 GeoGebra HTML，并直接在 Codex 侧栏浏览器中查看和操作。

默认流程无需启动 MCP，也无需安装独立 Chrome。页面运行官方 GeoGebra 引擎，需要联网。

## 使用流程

需要 Node.js >=22.12。安装已发布的技能优先版本：
`npx @lydt/geogebra-studio@0.4.0 install`。本地开发使用 `npm ci`、`npm run build`，再运行
`node dist/cli.js install --local`。安装不会探测或下载浏览器。重新打开 Codex 聊天以加载技能。

让 Codex 根据问题编写构造 JSON，例如：

```json
{
  "commands": ["A=(0,0)", "B=(4,0)", "c=Circle(A,B)"],
  "visibleLabels": ["A", "B"],
  "filename": "circle.html"
}
```

从插件目录运行：

```sh
node dist/cli.js generate --input /绝对路径/diagram.json --workspace /绝对路径/项目
```

生成器只创建新文件，不覆盖已有 HTML，也不执行几何构造。Codex 将返回的文件在右侧浏览器打开；
如果内置浏览器不允许本地文件 URL，可在项目目录启动仅监听 `127.0.0.1` 的静态服务器，再打开对应 HTTP URL。
页面加载后执行命令，显示具体失败命令，并检查可见对象是否有定义及坐标轴比例。
生成成功不等于几何正确，仍需检查实际图形。

## 其他代理与普通浏览器

JSON → HTML 生成器不依赖 Codex。其他具有文件写入和终端能力的代理可以在
构建后的仓库中运行同一条 `generate` 命令，再用现代浏览器打开返回的 HTML。
尚未验证其他代理的原生插件或技能安装兼容性。可选 MCP 配置见
[mcp.optional.json](mcp.optional.json)。仍需 Node >=22.12。

## 面向教师的完整示例

参照[从零开始教程](docs/TEACHER-QUICKSTART.zh-CN.md)，将
[直角三角形 JSON](examples/right-triangle.json) 生成可编辑图形，修改边长、
检查勾股关系与外接圆性质，并保存当前构造。

![GeoGebra 实际渲染的直角三角形与外接圆](docs/images/right-triangle.png)

## 编辑和保存

拖动自由点，点击画布左上角按钮展开 GeoGebra 对象栏，编辑定义或样式。
右上角可以切换主题和下载 GGB、HTML、PNG、SVG、PDF、XML、TikZ。
TikZ 使用原生 PGF，经内置 Gikz 清洗。

**编辑不会自动写回原始 HTML 或 JSON。关闭或刷新前，下载当前 HTML/GGB 保存。**
下载的 HTML 内嵌当前 GGB，重新打开后保留编辑状态。

页面提供 `window.geogebraStudio.status`（loading/executing/ready/error）、失败命令和检查结果。
`await window.geogebraStudio.snapshot()` 可读取当前 GGB、XML 和检查结果，不需要后台 MCP。

## 可选后台自动化

`generate ... --verify` 显式启用 Chrome，执行构造、打包 GGB、重新打开文件验证，并生成预览 PNG。
仅在批量处理或后台验证时使用；需要时运行 `node dist/cli.js browser install` 准备浏览器。

旧 MCP 工具保持兼容，使用 `node dist/cli.js mcp` 启动。
默认插件清单不注册任何 MCP 服务；`mcp.optional.json` 是可选接入配置。
解压后的无依赖插件运行生成器无需 npm install；可选后台功能需要安装运行时依赖。

开发检查：`npm run verify`、`npm run test:unit`。
可选 MCP 检查：`npm run verify:mcp`。`doctor` 只检查生成器与 Gikz，不启动 Chrome。

贡献流程和数学回归检查见 [CONTRIBUTING.md](CONTRIBUTING.md)。

项目独立于 GeoGebra 官方。组合发行包采用 GPL-2.0-or-later，保留原 MCP 的 MIT 声明；
详见 [LICENSE](LICENSE)、[LICENSE-MIT](LICENSE-MIT) 和
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。当前未打包离线引擎，课堂使用前请检查联网加载。
