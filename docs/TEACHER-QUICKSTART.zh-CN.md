# 第一份课堂构造：直角三角形与外接圆

本例探索勾股关系和“斜边中点是直角三角形外心”。需要 Node.js >=22.12，
以及能够加载 GeoGebra 官方引擎的网络。[English walkthrough](TEACHER-QUICKSTART.md)

## 从 JSON 生成页面

在仓库根目录运行，首次使用先安装依赖并构建：

```sh
npm ci
npm run build
mkdir -p output/teacher-demo
node dist/cli.js generate --input "$PWD/examples/right-triangle.json" --workspace "$PWD/output/teacher-demo"
```

完整输入见 [examples/right-triangle.json](../examples/right-triangle.json)。
A=(0,0)，B=A+(b,0)，C=A+(0,h)，初始 b=4、h=3；M 为 BC 中点，圆心为 M，圆经过 B。
输出 JSON 包含 `success: true`、以 `output/teacher-demo/right-triangle.html`
结尾的绝对路径 `filename`、`execution: "viewer"`、`requiresNetwork: true`，
以及 `engineVerified: false`、`renderVerified: false`。
后两个标记说明此时只是生成文件，还没有运行几何引擎。

用 Codex 侧栏浏览器或普通浏览器打开返回的 HTML。如果无法直接打开本地文件，
在另一终端运行以下服务器，并保持运行：

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory "$PWD/output/teacher-demo"
```

打开[本机页面](http://127.0.0.1:8765/right-triangle.html)。端口被占用时换一个端口；
课后按 Ctrl+C 停止服务器。

![官方 GeoGebra 引擎实际渲染的构造](images/right-triangle.png)

## 课堂探索与检查

点击左上角按钮打开对象编辑栏，将 b、h 改为 3、4。拖动自由点 A，
B、C 会根据定义跟随移动。让学生观察哪些量变化、哪些性质保持。初始状态应满足：

- AB=4、AC=3、BC=5，AB²+AC²=BC²。
- AB⊥AC，∠BAC=90°。
- MA=MB=MC=2.5，因此 A、B、C 都在圆上。

还可检查 b=1.5、h=2 和 b=8、h=6。本入门练习保持 b、h 都为正数；
任一为零时三角形退化，角没有定义。负值会改变图形朝向，不在本练习范围内。
拖动和数值检验用于发现规律，完整的一般性结论仍需数学证明。

如能使用浏览器开发工具，`window.geogebraStudio.status` 应为 `"ready"`；
`"error"` 会记录失败命令的位置。长期停留在加载状态可能是引擎资源被网络阻断。
还要实际查看图形和标签，不能只凭生成成功判断正确。

## 保存与用于讲义

关闭页面前，在右上角下载**当前 HTML** 或 **GGB**，重新打开下载文件，
确认修改后的边长保留。页面编辑不会自动写回原始 JSON 或磁盘上的 HTML。
PNG、PDF 可用于讲义；TikZ 经过原生 PGF 与内置 Gikz 清洗，放入自己的
LaTeX 文档后仍应实际编译检查。

若要从 JSON 再生成，使用新的文件名，避免覆盖已有文件：

```sh
node dist/cli.js generate --input "$PWD/examples/right-triangle.json" --workspace "$PWD/output/teacher-demo" --output right-triangle-v2.html
```

构建后还可在 Chrome 可用时运行 `npm run verify:math` 做数学回归检查（mathematical
regression checks）。配置方法、检查范围和数值容差见 [贡献指南](../CONTRIBUTING.md)。
