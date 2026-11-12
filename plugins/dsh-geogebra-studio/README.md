# dsh-geogebra-studio

DeepSeek Harness sidebar plugin for GeoGebra Studio. It adds one button on the official `sidebar.footer.action` seat. The button opens a guide. It does not install the Agent Skill and it does not draw a figure.

GeoGebra Studio is an independent project and is not affiliated with GeoGebra. License: GPL-2.0-or-later.

## Install

Into the web profile, from GitHub. Quote the spec so the subdirectory is kept:

```sh
dsh plugin --profile web add "github:YZDame/GeoGebra-Studio#main&path:plugins/dsh-geogebra-studio"
```

From a checkout of this repository:

```sh
dsh plugin --profile web add ./plugins/dsh-geogebra-studio
```

Restart `dsh web`. The GeoGebra button sits in the sidebar foot, above Settings. A wide sidebar shows the icon and the label. The collapsed rail shows the icon only. Clicking it opens the guide: invoke `/geogebra-studio` after the Skill is installed, the Node.js 22.12+ and HTTP-preview requirements, a starter prompt, and the unofficial-project notice.

On Windows, an older `dsh` can pass that GitHub spec through `cmd.exe`, which treats `&` as a command separator and installs the repository root instead. Use the checkout path in that case.

Do not install the repository root, `@lydt/geogebra-studio`, or `skills/geogebra-studio/` with `dsh plugin add`. Those are not this sidebar plugin. The Agent Skill is still installed with:

```sh
npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio
```

## Develop

```sh
npm install
npm run build
npm run verify
```

`lib/client.js` is the browser bundle the web shell loads. Commit it with source changes. The host entry `lib/index.js` registers no tools.
