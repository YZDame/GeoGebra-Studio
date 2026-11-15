<p align="center"><img src="assets/geogebra-icon.png" width="80" height="80" alt=""></p>
<h1 align="center">GeoGebra Studio</h1>

<p align="center">
  <a href="skills/geogebra-studio/SKILL.md"><img src="https://img.shields.io/badge/Agent_Skill-geogebra--studio-0F766E" alt="Agent Skill: geogebra-studio"></a>
  <a href="https://yzdame.github.io/GeoGebra-Studio/"><img src="https://img.shields.io/badge/demo-GitHub_Pages-2563EB" alt="Interactive gallery on GitHub Pages"></a>
  <a href="https://www.npmjs.com/package/@lydt/geogebra-studio"><img src="https://img.shields.io/npm/v/@lydt/geogebra-studio?label=Studio%20npm" alt="GeoGebra Studio npm version"></a>
  <a href="https://www.npmjs.com/package/dsh-geogebra-studio"><img src="https://img.shields.io/npm/v/dsh-geogebra-studio?label=DSH%20npm" alt="DeepSeek Harness plugin npm version"></a>
  <a href="https://www.npmjs.com/package/@lydt/geogebra-studio"><img src="https://img.shields.io/npm/dm/@lydt/geogebra-studio?label=Studio%20downloads" alt="GeoGebra Studio monthly npm downloads"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-GPL--2.0--or--later-blue.svg" alt="License: GPL-2.0-or-later"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-%E2%89%A522.12-339933?logo=node.js" alt="Node.js 22.12 or later"></a>
  <a href="https://github.com/YZDame/GeoGebra-Studio/stargazers"><img src="https://img.shields.io/github/stars/YZDame/GeoGebra-Studio?style=flat" alt="GitHub stars"></a>
</p>

**GeoGebra Studio** est une **Agent Skill** standard (accompagnée de plugins optionnels pour Codex et DeepSeek Harness). Dans Claude Code, Codex, Cursor, DeepSeek Harness ou tout client compatible Agent Skills, décrivez à votre IA ce que vous voulez tracer — ou envoyez un document d'exercice ou une image de référence — pour obtenir une page GeoGebra interactive en 2D ou 3D que vous pouvez manipuler, modifier et exporter. Envie d'essayer d'abord ? Parcourez la [galerie interactive sur GitHub Pages](https://yzdame.github.io/GeoGebra-Studio/) directement dans votre navigateur, sans rien installer.

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md)

## Démarrage rapide

1. **Installez l'Agent Skill** (nécessite Node.js 22.12+ ; voir [Installation](#installation) ci-dessous pour les plugins Codex et DeepSeek Harness) :

   ```sh
   npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
   ```

2. **Demandez à votre IA de tracer une figure**, ou envoyez un énoncé ou une image de référence (les options d'envoi dépendent de votre client IA) :

   > Trace un triangle et son cercle circonscrit. Laisse-moi déplacer les sommets.

3. **Manipulez, modifiez et exportez** : Ouvrez la page générée pour déplacer les points et ajuster les valeurs, ou demandez des modifications supplémentaires à l'IA. **Téléchargez le fichier HTML ou GGB actuel avant de fermer ou d'actualiser la page pour conserver vos modifications.**

| Générer | Modifier | Exporter |
| --- | --- | --- |
| ![Générer une figure interactive](docs/images/generate.gif) | ![Modifier des valeurs et voir la figure se mettre à jour](docs/images/edit.gif) | ![Choisir un format et télécharger](docs/images/export.gif) |

## Fonctionnalités

- Figures GeoGebra 2D et 3D avec points déplaçables, paramètres ajustables, neuf thèmes et modes clair/sombre.
- Téléchargement direct depuis la page en **HTML, GGB, PNG, SVG, PDF, XML et TikZ**.
- Export de code source **Asymptote** et **TSQX/Asymptote mixte** via l'IA ; voir les [détails d'exportation](skills/geogebra-studio/references/exports.md).
- Flux portable basé sur [`SKILL.md`](skills/geogebra-studio/SKILL.md), sans serveur MCP, ni backend, ni base de données.

## Installation

Utilisable sur macOS, Windows ou Linux avec **Node.js 22.12 ou supérieur**. Votre client IA doit pouvoir lire/écrire des fichiers et exécuter des commandes. L'ouverture d'une page générée nécessite un accès Internet pour charger le moteur officiel GeoGebra.

**Choisissez l'une des méthodes suivantes selon votre client IA :**

### 1. Installation générale en tant qu'Agent Skill (recommandée)

Pour Claude Code, Cursor, Codex et les autres clients compatibles avec Agent Skills. Suivez les invites pour choisir votre client et la portée de l'installation.

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

Vous pouvez aussi copier tout le dossier [`skills/geogebra-studio/`](skills/geogebra-studio/) dans le répertoire Skills de votre client, en conservant tous les fichiers aux côtés de `SKILL.md`.

### 2. Installation dans Codex (plugin optionnel)

Lancez l'installateur du plugin Codex puis ouvrez une nouvelle session Codex.

```sh
npx @lydt/geogebra-studio@latest install
```

<img src="docs/images/cover.png" alt="Géométrie dans l'espace en 3D générée par IA avec une section mobile" width="100%">

### 3. Installation dans DeepSeek Harness (canevas interactif latéral)

Dans l'application de bureau, ouvrez **Plugins → Add Plugin**, collez le nom du paquet ci-dessous et installez-le. Le plugin embarque déjà la skill `geogebra-studio` : aucune installation séparée de la Skill n'est nécessaire.

```text
dsh-geogebra-studio
```

Ouvrez **GeoGebra Studio** depuis la barre latérale gauche pour afficher le canevas interactif à côté de votre discussion. Voir le [guide du plugin](plugins/dsh-geogebra-studio/) pour l'installation en ligne de commande.

<img src="docs/images/dsh-right-canvas.png" alt="Ellipse avec ses foyers, directrices et une corde focale réglable dans le canevas DeepSeek Harness" width="100%">

Consultez [installation et dépannage](skills/geogebra-studio/references/installation.md) pour plus de détails.

## Ressources

[Exemples](examples/README.md) · [Galerie interactive](https://yzdame.github.io/GeoGebra-Studio/) · [Spécification de la Skill](skills/geogebra-studio/SKILL.md) · [Développement et contribution](CONTRIBUTING.md)

Projet communautaire indépendant, sans affiliation avec GeoGebra. Licence [GPL-2.0-or-later](LICENSE), conservant les [attributions MIT antérieures](LICENSE-MIT) et les [mentions tierces](THIRD_PARTY_NOTICES.md).
