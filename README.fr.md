# GeoGebra Studio

[![CI](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml) [![License: GPL-2.0-or-later](https://img.shields.io/badge/license-GPL--2.0--or--later-blue.svg)](LICENSE) [![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522.12-339933?logo=node.js)](https://nodejs.org/) [![GitHub stars](https://img.shields.io/github/stars/YZDame/GeoGebra-Studio?style=flat)](https://github.com/YZDame/GeoGebra-Studio/stargazers)

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md)

**Une Agent Skill portable pour créer, modifier et exporter des constructions mathématiques interactives avec GeoGebra.**

![GeoGebra construction](docs/images/right-triangle.png)

## Fonctionnalités

- Figures GeoGebra natives et modifiables en 2D/3D, avec objets dépendants et vue Algèbre.
- Visionneuse adaptative, neuf familles de thèmes et modes clair/sombre.
- Sept téléchargements : **GGB, HTML, PNG, SVG, PDF, XML et TikZ**.
- Exports locaux supplémentaires vers **Asymptote** et **TSQX/Asymptote mixte** depuis XML.
- Aucun serveur MCP, backend ni base de données en utilisation courante.

## Prérequis

Node.js **22.12 ou supérieur**. L'ouverture du HTML généré nécessite Internet pour charger le moteur officiel GeoGebra.

## Installation recommandée

Installez la Skill depuis GitHub dans un environnement compatible avec Agent Skills. Vous pouvez également copier **tout** le dossier `skills/geogebra-studio/`, avec `SKILL.md`, `scripts/`, `references/` et `runtime/`. Le fichier `SKILL.md` seul ne suffit pas. L'agent doit pouvoir écrire des fichiers et exécuter des commandes.

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

## Plugin Codex facultatif

Le Plugin Codex est un complément facultatif. Le code du dépôt correspond à la version **0.5.0**. Si elle n'est pas encore disponible sur npm, installez la Skill depuis GitHub ou utilisez une version compilée. Redémarrez Codex après installation.

```sh
npx @lydt/geogebra-studio@0.5.0 install
```

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

Ressources : [guide enseignant](docs/TEACHER-QUICKSTART.md), [exemples](examples/), [architecture](docs/MODERNIZATION.md) et [contributions](CONTRIBUTING.md).

Projet communautaire indépendant, sans affiliation avec GeoGebra. Licence combinée **GPL-2.0-or-later**. Voir [LICENSE](LICENSE), [LICENSE-MIT](LICENSE-MIT) et les [mentions tierces](THIRD_PARTY_NOTICES.md).
