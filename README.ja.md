# GeoGebra Studio

[![CI](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml) [![License: GPL-2.0-or-later](https://img.shields.io/badge/license-GPL--2.0--or--later-blue.svg)](LICENSE) [![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522.12-339933?logo=node.js)](https://nodejs.org/) [![GitHub stars](https://img.shields.io/github/stars/YZDame/GeoGebra-Studio?style=flat)](https://github.com/YZDame/GeoGebra-Studio/stargazers)

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md)

**GeoGebra の編集可能な数学図形を生成・編集・書き出しするための、移植可能な Agent Skill です。**

## 使い方

<img src="docs/images/cover.png" alt="macOS の Codex。中国語で GeoGebra Studio が高校の立体幾何を 3D で描けるか尋ね、右側に高さ h の可動断面を持つ四分の一円柱の立体がある。" width="100%">

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

## Agent Skill のインストール（推奨）

Agent Skills 対応環境で GitHub から `geogebra-studio` をインストールします。または `skills/geogebra-studio/` フォルダーを **丸ごと** コピーしてください。`SKILL.md`、`scripts/`、`references/`、`runtime/` がすべて必要で、`SKILL.md` だけでは動作しません。Agent にはファイル書き込みとコマンド実行の権限が必要です。

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

## DeepSeek Harness

DeepSeek Harness（`dsh`）では GeoGebra Studio を二つの別々の方法で使えます。図を作るのは Agent Skill です。公開済みの `SKILL.md` は必要な kebab-case の `name` と `description` をすでに持っているため、frontmatter はそのままです。カタログは `name` と `description` で振り分けるので、任意の `whenToUse` は付けていません。サイドバーのボタンは別パッケージの [`plugins/dsh-geogebra-studio/`](plugins/dsh-geogebra-studio/) です。リポジトリのルート、`@lydt/geogebra-studio`、`skills/geogebra-studio/` に対して `dsh plugin add` を実行しないでください。これらはサイドバープラグインではありません。

他のクライアントと同じインストーラを使います。既定モードでは完全なコピーが `.agents/skills/geogebra-studio` に書き込まれ、DeepSeek Harness はこのディレクトリをすでに走査します。

- `-g` なし: カレントディレクトリの `./.agents/skills/geogebra-studio`。そのプロジェクトの Git ルートがワークスペースなら発見されます。インストーラが範囲を尋ねる場合、プロジェクトを選ぶとこのパスになります。
- `-g` を付けるか、尋ねられたときに Global を選ぶと `~/.agents/skills/geogebra-studio` になります。DeepSeek Harness はすべてのワークスペースでこのディレクトリを走査します。

ホームディレクトリへ置く場合は `-g` を付けます。`~/.claude/skills` や `~/.cursor/skills` などのリンクは各クライアント用です。DeepSeek Harness が走査するのは `~/.dsh/skills`、`~/.agents/skills`、およびプロジェクト内の `.dsh/skills` と `.agents/skills` です。`.agents/skills` へコピーされる既定モードのままにしてください。`--copy` はそのディレクトリを書きません。

手動では `skills/geogebra-studio/` フォルダー全体（`SKILL.md`、`scripts/`、`references/`、`runtime/`）を次のいずれかにコピーします。

- `~/.dsh/skills/geogebra-studio`
- `~/.agents/skills/geogebra-studio`

チャットでは `/geogebra-studio` で呼び出します。

このリポジトリを DeepSeek Harness のワークスペースとして開いても、`skills/geogebra-studio/` は自動では見つかりません。探索は `.dsh/skills` と `.agents/skills` の直下だけです。フォルダー全体をワークスペース内の `.dsh/skills/geogebra-studio` または `.agents/skills/geogebra-studio` にコピーしてください。ワークスペース専用なら `.dsh/skills/geogebra-studio` を優先します。このリポジトリはそのコピーもシンボリックリンクも同梱しません。Windows の Git はシンボリックリンクをしばしばテキストファイルとして展開し、`.agents/skills` は Codex、Cursor、`npx skills` がすでに使うインストール先です。`.agents/plugins` は任意の Codex マーケットプレイス記録のままです。

### サイドバーのボタン

サイドバープラグインを web プロファイルに入れ、その後 `dsh web` を再起動します。サブディレクトリが残るよう、GitHub の指定は引用符で囲みます。

```sh
dsh plugin --profile web add "github:YZDame/GeoGebra-Studio#main&path:plugins/dsh-geogebra-studio"
```

このリポジトリのチェックアウトから:

```sh
dsh plugin --profile web add ./plugins/dsh-geogebra-studio
```

プラグインは公式の `sidebar.footer.action` リストに一つ登録されます。場所はサイドバー下部で、設定の上です。サイドバーが広いときは幾何アイコンと GeoGebra のラベルが表示され、折りたたんだレールではアイコンだけです。クリックすると案内が開きます。`/geogebra-studio` の呼び出し方、Node.js 22.12 以降と HTTP プレビューの要件、コピーできる開始文、そして非公式プロジェクトである旨です。このボタンは Skill をインストールせず、図も描きません。Windows では古い `dsh` がその GitHub 指定を `cmd.exe` に渡すことがあり、`&` がコマンド区切りになってリポジトリのルートがインストールされます。その場合はチェックアウトのパスを使います。

要件は他のクライアントと同じです。Node.js 22.12 以降、ファイルとシェルへのアクセス、そしてクライアントがループバック URL を開けるときは HTTP プレビューを使います。GeoGebra Studio は独立したプロジェクトであり、GeoGebra とは無関係です。

## Codex Plugin（任意）

Codex 用ラッパーは任意です。**0.6.0** は npm で公開済みです。インストール後は Codex セッションを再起動します。

```sh
npx @lydt/geogebra-studio@0.6.0 install
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
