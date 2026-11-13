<p align="center"><img src="assets/geogebra-icon.png" width="80" height="80" alt=""></p>
<h1 align="center">GeoGebra Studio</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@lydt/geogebra-studio"><img src="https://img.shields.io/npm/v/@lydt/geogebra-studio?label=Studio%20npm" alt="GeoGebra Studio npm version"></a>
  <a href="https://www.npmjs.com/package/dsh-geogebra-studio"><img src="https://img.shields.io/npm/v/dsh-geogebra-studio?label=DSH%20npm" alt="DeepSeek Harness plugin npm version"></a>
  <a href="https://www.npmjs.com/package/@lydt/geogebra-studio"><img src="https://img.shields.io/npm/dm/@lydt/geogebra-studio?label=Studio%20downloads" alt="GeoGebra Studio monthly npm downloads"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-GPL--2.0--or--later-blue.svg" alt="License: GPL-2.0-or-later"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-%E2%89%A522.12-339933?logo=node.js" alt="Node.js 22.12 or later"></a>
  <a href="https://github.com/YZDame/GeoGebra-Studio/stargazers"><img src="https://img.shields.io/github/stars/YZDame/GeoGebra-Studio?style=flat" alt="GitHub stars"></a>
</p>

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md)

**GeoGebra の編集可能な数学図形を生成・編集・書き出しするための、移植可能な Agent Skill です。**

## 使い方

| 生成 | 編集 | 書き出し |
| --- | --- | --- |
| ![端末で generate / preview（ZoomIn を含む）を実行し、外接円全体が見える直角三角形をローカルビューアに読み込む。](docs/images/generate.gif) | ![代数ビューで b を 4→3、続いて h を 3→4 に変えると、三角形と外接円全体がすぐに更新される。](docs/images/edit.gif) | ![Download メニューに GGB、PNG、SVG、TikZ、PDF、XML、HTML が表示され、SVG と TikZ をクリックしたあと、書き出された TikZ ソースが表示される。](docs/images/export.gif) |
| コマンド JSON から、あらかじめ配置したローカルの対話ビューアへ。 | 自由な値を変えても、依存オブジェクトは関係を保つ。 | 一つの作図。実際の Download メニューから七つの形式。 |

## 主な機能

- GeoGebra 標準エンジンによる編集可能な 2D／3D 図形、依存オブジェクト、代数ビュー。
- 画面サイズに対応したビューア、9 種類のテーマとライト／ダークモード。
- ビューアから **GGB・HTML・PNG・SVG・PDF・XML・TikZ** の 7 形式をダウンロード。
- XML から **Asymptote** および **TSQX/Asymptote 混合形式**へのローカル変換。
- 通常の作業に MCP サーバー、バックエンド、データベースは不要。

## 動作要件

Node.js **22.12 以降**。生成された HTML を開くときは、GeoGebra 公式エンジンをオンラインで読み込むため、インターネット接続が必要です。

## インストール

### 1. 汎用インストール

Codex、Claude Code、Cursor など、Agent Skills に対応するクライアントで使えます。案内に従ってクライアントとインストール範囲を選びます。

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

### 2. Codex にインストール

インストーラーを実行し、新しい Codex セッションを開きます。

```sh
npx @lydt/geogebra-studio@latest install
```

<img src="docs/images/cover.png" alt="macOS の Codex。中国語で GeoGebra Studio が高校の立体幾何を 3D で描けるか尋ね、右側に高さ h の可動断面を持つ四分の一円柱の立体がある。" width="100%">

### 3. DeepSeek Harness にインストール

デスクトップアプリで **Plugins → Add Plugin** を開き、以下のパッケージ名を貼り付けてインストールします。

```text
dsh-geogebra-studio
```

左側のサイドバーから **GeoGebra Studio** を開きます。コマンドラインでのインストールは[プラグインガイド](plugins/dsh-geogebra-studio/)を参照してください。

<img src="docs/images/dsh-right-canvas.png" alt="DeepSeek Harness で表示した楕円と調整可能な焦点弦" width="100%">

## クイックスタート

`diagram.json` を作成し、Agent に Skill の実行を依頼するか、ローカルの生成コマンドを実行します：

```json
{
  "filename": "circle.html",
  "commands": ["A=(0,0)", "B=(4,0)", "c=Circle(A,B)"],
  "visibleLabels": ["A", "B"]
}
```

```sh
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs generate --input /absolute/project/diagram.json --workspace /absolute/project
```

## 編集と保存

生成された HTML をブラウザーで開き、自由点をドラッグしたり代数ビューでオブジェクトを編集したりできます。**閉じる・再読み込みする前に現在の HTML または GGB をダウンロードしてください。** 元のファイルは自動更新されません。保存した HTML は編集可能な構成を保持します。

## ソース形式への書き出し

ビューアから現在の XML をダウンロードするか、`await window.geogebraStudio.snapshot()` を使用して、次のコマンドで変換します。TSQX は **TSQX と Asymptote の混合形式**であり、純粋な TSQX ではありません。未対応の依存関係は明示的にエラーとなります。

```sh
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs export --input /absolute/project/figure.xml --format tsqx --workspace /absolute/project --output figure.tsqx
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs export --input /absolute/project/figure.xml --format asymptote --workspace /absolute/project --output figure.asy
```

## 開発と検証

```sh
npm ci
npm run verify
npm run test:unit
```

実際のブラウザーを用いる任意の検証には Chrome とインターネットが必要です。通常のローカル生成には Chrome も MCP サーバーも必要ありません。

関連資料：[インタラクティブギャラリー](https://yzdame.github.io/GeoGebra-Studio/)、[サンプル](examples/README.md)、[アーキテクチャ](docs/MODERNIZATION.md)、[貢献ガイド](CONTRIBUTING.md)。

GeoGebra Studio は GeoGebra 公式とは無関係の独立したコミュニティプロジェクトです。ライセンスは **GPL-2.0-or-later**。[LICENSE](LICENSE)、[LICENSE-MIT](LICENSE-MIT)、[第三者に関する表示](THIRD_PARTY_NOTICES.md)を参照してください。
