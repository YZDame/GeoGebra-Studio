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

**Une Agent Skill portable pour créer, modifier et exporter des constructions mathématiques interactives avec GeoGebra.**

## Comment ça marche

| Générer | Modifier | Exporter |
| --- | --- | --- |
| ![Le terminal lance generate et preview (avec ZoomIn) ; le visualiseur local charge le triangle rectangle avec le cercle circonscrit entièrement visible.](docs/images/generate.gif) | ![Dans la vue Algèbre, b passe de 4 à 3 puis h de 3 à 4 ; le triangle et le cercle circonscrit complet se mettent à jour.](docs/images/edit.gif) | ![Menu Download avec GGB, PNG, SVG, TikZ, PDF, XML et HTML ; clics sur SVG et TikZ, puis le source TikZ exporté.](docs/images/export.gif) |
| Du JSON de commandes au visualiseur local interactif déjà cadré. | Modifiez une valeur libre. Les objets dépendants conservent leurs relations. | Une construction. Sept formats depuis le vrai menu Download. |

## Fonctionnalités

- Figures GeoGebra natives et modifiables en 2D/3D, avec objets dépendants et vue Algèbre.
- Visionneuse adaptative, neuf familles de thèmes et modes clair/sombre.
- Sept téléchargements : **GGB, HTML, PNG, SVG, PDF, XML et TikZ**.
- Exports locaux supplémentaires vers **Asymptote** et **TSQX/Asymptote mixte** depuis XML.
- Aucun serveur MCP, backend ni base de données en utilisation courante.

## Prérequis

Node.js **22.12 ou supérieur**. L'ouverture du HTML généré nécessite Internet pour charger le moteur officiel GeoGebra.

## Installation

### 1. Installation générale

Pour Codex, Claude Code, Cursor et les autres clients compatibles avec Agent Skills. Suivez les indications pour choisir le client et la portée de l’installation.

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

### 2. Installation dans Codex

Lancez l’installation puis ouvrez une nouvelle session Codex.

```sh
npx @lydt/geogebra-studio@latest install
```

<img src="docs/images/cover.png" alt="Codex sous macOS : une question en chinois demandant si GeoGebra Studio peut tracer la géométrie dans l’espace du lycée, à côté d’un quart de cylindre avec une section mobile à la hauteur h." width="100%">

### 3. Installation dans DeepSeek Harness

Dans l’application de bureau, ouvrez **Plugins → Add Plugin**, collez le nom du paquet et installez-le.

```text
dsh-geogebra-studio
```

Ouvrez **GeoGebra Studio** dans la barre latérale gauche. Le [guide du plugin](plugins/dsh-geogebra-studio/) décrit aussi l’installation en ligne de commande.

<img src="docs/images/dsh-right-canvas.png" alt="Ellipse avec une corde focale réglable dans DeepSeek Harness" width="100%">

## Démarrage rapide

Créez `diagram.json`, puis demandez à votre agent d'utiliser la Skill ou lancez le générateur :

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

## Modifier et enregistrer

Ouvrez le HTML dans votre navigateur, déplacez les points libres et modifiez les objets depuis la vue Algèbre. **Téléchargez le HTML ou le GGB actuel avant de fermer ou d'actualiser**. Les fichiers initiaux ne sont pas mis à jour automatiquement. Le HTML téléchargé conserve une construction modifiable.

## Export des sources

Téléchargez le XML actuel depuis la visionneuse (ou utilisez `await window.geogebraStudio.snapshot()`), puis exécutez ces commandes. TSQX est un format **mixte avec Asymptote**, non du TSQX pur ; les dépendances non prises en charge provoquent une erreur explicite.

```sh
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs export --input /absolute/project/figure.xml --format tsqx --workspace /absolute/project --output figure.tsqx
node /path/to/geogebra-studio/scripts/geogebra-studio.cjs export --input /absolute/project/figure.xml --format asymptote --workspace /absolute/project --output figure.asy
```

## Développement et vérification

```sh
npm ci
npm run verify
npm run test:unit
```

Les tests facultatifs en navigateur réel requièrent Chrome et Internet. La génération locale normale ne requiert ni Chrome ni serveur MCP.

Ressources : [Galerie interactive](https://yzdame.github.io/GeoGebra-Studio/), [exemples](examples/README.md), [architecture](docs/MODERNIZATION.md) et [contributions](CONTRIBUTING.md).

Projet communautaire indépendant, sans affiliation avec GeoGebra. Licence combinée **GPL-2.0-or-later**. Voir [LICENSE](LICENSE), [LICENSE-MIT](LICENSE-MIT) et les [mentions tierces](THIRD_PARTY_NOTICES.md).
