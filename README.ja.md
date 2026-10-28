# GeoGebra Studio

[![CI](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml) [![License: GPL-2.0-or-later](https://img.shields.io/badge/license-GPL--2.0--or--later-blue.svg)](LICENSE) [![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522.12-339933?logo=node.js)](https://nodejs.org/) [![GitHub stars](https://img.shields.io/github/stars/YZDame/GeoGebra-Studio?style=flat)](https://github.com/YZDame/GeoGebra-Studio/stargazers)

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md)

**GeoGebra の編集可能な数学図形を生成・編集・書き出しするための、移植可能な Agent Skill です。**

![GeoGebra construction](docs/images/right-triangle.png)

## 主な機能

- GeoGebra 標準エンジンによる編集可能な 2D／3D 図形、依存オブジェクト、代数ビュー。
- 画面サイズに対応したビューア、9 種類のテーマとライト／ダークモード。
- ビューアから **GGB・HTML・PNG・SVG・PDF・XML・TikZ** の 7 形式をダウンロード。
- XML から **Asymptote** および **TSQX/Asymptote 混合形式**へのローカル変換。
- 通常の作業に MCP サーバー、バックエンド、データベースは不要。

## 動作要件

Node.js **22.12 以降**。生成された HTML を開くときは、GeoGebra 公式エンジンをオンラインで読み込むため、インターネット接続が必要です。

## Agent Skill のインストール（推奨）

Agent Skills 対応環境で GitHub から `geogebra-studio` をインストールします。または `skills/geogebra-studio/` フォルダーを **丸ごと** コピーしてください。`SKILL.md`、`scripts/`、`references/`、`runtime/` がすべて必要で、`SKILL.md` だけでは動作しません。Agent にはファイル書き込みとコマンド実行の権限が必要です。

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

## Codex Plugin（任意）

Codex 用ラッパーは任意です。リポジトリのソースは **0.5.0** です。npm で未公開の場合は GitHub から単体 Skill をインストールするか、ソースをビルドしてください。インストール後は Codex セッションを再起動します。

```sh
npx @lydt/geogebra-studio@0.5.0 install
```

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

関連資料：[教師向けガイド](docs/TEACHER-QUICKSTART.md)、[サンプル](examples/)、[アーキテクチャ](docs/MODERNIZATION.md)、[貢献ガイド](CONTRIBUTING.md)。

GeoGebra Studio は GeoGebra 公式とは無関係の独立したコミュニティプロジェクトです。ライセンスは **GPL-2.0-or-later**。[LICENSE](LICENSE)、[LICENSE-MIT](LICENSE-MIT)、[第三者に関する表示](THIRD_PARTY_NOTICES.md)を参照してください。
