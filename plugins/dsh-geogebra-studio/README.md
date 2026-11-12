# GeoGebra Studio for DeepSeek Harness

A DeepSeek Harness plugin that adds a **GeoGebra Studio** entry to the left sidebar and a live, editable GeoGebra canvas to the **right sidebar**, while the conversation stays open. Building a figure from chat renders it into that canvas; the same package also exports source and ships the `geogebra-studio` skill. It uses the same generator, viewer and export code as the portable [GeoGebra Studio Skill](../../skills/geogebra-studio/SKILL.md).

GeoGebra Studio is an independent project and is not affiliated with GeoGebra. License: GPL-2.0-or-later.

## What it adds

| Capability | Details |
| --- | --- |
| Left-rail entry | **GeoGebra Studio** sits beside Plugins, Automation and Tasks. It uses DSH's official split-view icon, not a custom mark. |
| Right-side canvas | Selecting the entry opens a blank GeoGebra canvas in the right sidebar. The conversation stays in the main column, so you can keep typing. |
| `geogebra_build` | Validates a JSON construction spec, writes a new editable HTML file in the workspace, and pushes the same construction into the right canvas. Never overwrites. |
| `geogebra_export` | Strict semantic TSQX or Asymptote from GeoGebra XML, or cleaned TikZ from native PGF. Rejects unsupported relations instead of freezing coordinates. |
| `geogebra_preview` | Optional standalone loopback link. The right canvas already updates after a build. |
| `geogebra-studio` skill | The construction format, visual standards, right-canvas workflow and export provenance. Registered by the plugin, so `npx skills add` is unnecessary in DeepSeek Harness. |
| Plugin inventory | The package contributes no custom artwork; DSH renders its official default plugin mark. |

The right canvas is the full generated viewer, including its template header: the objects/algebra toggle on the left, theme and light/dark controls, and GGB, HTML, PNG, SVG, PDF, XML and TikZ downloads on the right. The generated HTML and the standalone `geogebra_preview` show the same page in a normal browser. Rendering loads the official GeoGebra engine from its CDN, so the browser needs internet access; generating the HTML does not.

## Install

```sh
dsh plugin --profile web add dsh-geogebra-studio
```

Use `--profile desktop` for the Desktop app. Before a release, or when testing a branch, install from a checkout or from GitHub:

```sh
dsh plugin --profile web add ./plugins/dsh-geogebra-studio
dsh plugin --profile web add "github:YZDame/GeoGebra-Studio#main&path:plugins/dsh-geogebra-studio"
```

Restart `dsh web` or the Desktop app after installing. A left-rail **GeoGebra Studio** entry appears beside Plugins, Automation and Tasks; a new session can call the three tools and load the skill. The right-side canvas needs the Host web server (the normal Web and Desktop composition), and its routes live under `/dsh-geogebra-studio/`.

The plugin is self-contained: `runtime/` carries the bundled generator, viewer, Gikz cleaner and license. There is no `npm install`, MCP server, Chrome setup or separate Skill copy in the installed directory, and no dependency on the root package.

On Windows, an older `dsh` can pass the GitHub spec through `cmd.exe`, which treats `&` as a command separator and installs the repository root. Use the checkout path instead.

Do not install the repository root, `@lydt/geogebra-studio`, or `skills/geogebra-studio/` with `dsh plugin add`; those are not this plugin.

## Use

1. Click **GeoGebra Studio** in the left sidebar. A blank GeoGebra canvas opens in the right sidebar; the chat remains available.
2. Ask for a figure in the conversation, for example:

   > Draw a circle through three points and label them.

3. The agent calls `geogebra_build` with a spec such as:

   ```json
   {
     "filename": "circle.html",
     "commands": ["A=(0,0)", "B=(4,0)", "C=(1,3)", "c=Circle(A,B,C)"],
     "visibleLabels": ["A", "B", "C"],
     "showAxes": true
   }
   ```

   The right canvas reloads with that construction. The agent can keep iterating in the same conversation; each successful build replaces the canvas contents. The generated HTML is still written to the workspace, so the figure survives after the session.

4. Generation does not execute the geometry: inspect the canvas for labels, branches, tangency, clipping and light/dark contrast. The plugin cannot watch the canvas itself, so it reports rendering as unverified unless you confirm it.

Edits made in the canvas are not written back to disk: **download current HTML or GGB from the canvas header before leaving.** For TSQX, Asymptote or TikZ, download the current XML or native PGF from the same menu and pass the saved file to `geogebra_export`.

`workspace` is an absolute directory and defaults to the session working directory. Inputs and outputs are confined to it; symlinked escapes are rejected. The plugin creates new files only.

## Release

The package publishes on its own; it has no runtime dependencies:

```sh
cd plugins/dsh-geogebra-studio
npm publish --access public
```

npm may hold each publish in **staged publishing**: the package's **Staged packages** tab then needs a 2FA approval before the version becomes installable. 0.2.0 and 0.3.0 were approved. For CI releases, configure npm's trusted publisher for `dsh-geogebra-studio` (repository `YZDame/GeoGebra-Studio`, workflow `publish-dsh-plugin.yml`, environment `npm`); `dsh-v*` tags then publish with provenance through `.github/workflows/publish-dsh-plugin.yml`, without a long-lived token.

## Develop

The plugin runtime is generated by the repository build; the Client bundle is generated inside the plugin:

```sh
npm run build                              # root: dist/, Skill runtime, plugin runtime
npm run build --prefix plugins/dsh-geogebra-studio   # plugin: lib/client.js
npm run verify                             # includes the plugin contract, tools and bridge checks
```

`runtime/` and `lib/client.js` are committed so the GitHub directory installs without a build step. Rebuild and commit them with any source change.

The verifier executes every tool against a temporary workspace, calls the state and viewer routes with real request/response objects, checks the right-tab registration and the official icon import, and makes a real loopback preview request. A live profile still needs a restart to load a replaced Host module; the rendered left-rail entry and right canvas remain manual visual checks.
