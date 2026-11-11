# GeoGebra Studio

[![CI](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/YZDame/GeoGebra-Studio/actions/workflows/check.yml) [![License: GPL-2.0-or-later](https://img.shields.io/badge/license-GPL--2.0--or--later-blue.svg)](LICENSE) [![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522.12-339933?logo=node.js)](https://nodejs.org/) [![GitHub stars](https://img.shields.io/github/stars/YZDame/GeoGebra-Studio?style=flat)](https://github.com/YZDame/GeoGebra-Studio/stargazers)

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

## Installation recommandée

Installez la Skill depuis GitHub dans un environnement compatible avec Agent Skills. Vous pouvez également copier **tout** le dossier `skills/geogebra-studio/`, avec `SKILL.md`, `scripts/`, `references/` et `runtime/`. Le fichier `SKILL.md` seul ne suffit pas. L'agent doit pouvoir écrire des fichiers et exécuter des commandes.

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

## DeepSeek Harness

DeepSeek Harness (`dsh`) charge ce projet comme une Agent Skill. Le `SKILL.md` publié a déjà le `name` en kebab-case et la `description` requis ; le frontmatter reste inchangé. `whenToUse` est omis, car le catalogue route selon `name` et `description`. N'installez pas ce dépôt avec `dsh plugin add`. Cette commande ajoute un plugin d'interface, et ce projet ne fournit pas de plugin de barre latérale DeepSeek Harness.

Utilisez le même installeur que les autres clients. Dans le mode par défaut, une copie complète est écrite dans `.agents/skills/geogebra-studio`, un dossier que DeepSeek Harness parcourt déjà :

- Sans `-g` : `./.agents/skills/geogebra-studio` dans le répertoire courant. DeepSeek Harness la trouve lorsque la racine Git de ce projet est l'espace de travail. Si l'installeur demande la portée, le choix projet est ce chemin.
- Avec `-g`, ou Global lorsqu'il demande : `~/.agents/skills/geogebra-studio`. DeepSeek Harness parcourt ce dossier dans chaque espace de travail.

Ajoutez `-g` pour la copie dans le répertoire personnel. Des liens comme `~/.claude/skills` ou `~/.cursor/skills` concernent d'autres clients. DeepSeek Harness parcourt `~/.dsh/skills`, `~/.agents/skills`, ainsi que `.dsh/skills` et `.agents/skills` dans le projet. Conservez le mode par défaut afin d'écrire la copie `.agents/skills`. `--copy` ignore ce dossier.

Pour une installation manuelle, copiez **tout** le dossier `skills/geogebra-studio/`, avec `SKILL.md`, `scripts/`, `references/` et `runtime/` :

- `~/.dsh/skills/geogebra-studio`
- `~/.agents/skills/geogebra-studio`

Dans le chat, appelez-la avec `/geogebra-studio`.

Ouvrir ce dépôt comme espace de travail DeepSeek Harness ne découvre pas `skills/geogebra-studio/`. La recherche ne lit que les enfants directs de `.dsh/skills` et `.agents/skills`. Copiez le dossier entier vers `.dsh/skills/geogebra-studio` ou `.agents/skills/geogebra-studio` dans l'espace de travail. Pour une copie limitée à cet espace, préférez `.dsh/skills/geogebra-studio`. Ce dépôt ne contient ni cette copie ni un lien symbolique : sous Windows, Git extrait souvent les liens symboliques comme de simples fichiers texte, et `.agents/skills` est déjà le dossier d'installation de Codex, Cursor et `npx skills`. `.agents/plugins` reste l'entrée facultative de la marketplace Codex.

Les exigences sont les mêmes : Node.js 22.12 ou supérieur, accès aux fichiers et au shell, et l'aperçu HTTP lorsque le client peut ouvrir une URL de loopback. GeoGebra Studio est un projet indépendant, sans lien avec GeoGebra.

## Plugin Codex facultatif

Le Plugin Codex est un complément facultatif. La version **0.6.0** est publiée sur npm. Redémarrez Codex après installation.

```sh
npx @lydt/geogebra-studio@0.6.0 install
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
