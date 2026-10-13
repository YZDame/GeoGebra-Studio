---
name: geogebra-setup
description: Install or diagnose the local GeoGebra Studio Codex plugin, its built-in Gikz, Chrome runtime, and geometry export workflow.
---

GeoGebra Studio includes MCP, three skills, the HTML viewer and built-in Gikz.
Node >=22.12.0 and npm/npx are required. A full plugin installation is:

```sh
npx @lydt/geogebra-studio install
```

This registers a persistent version-pinned marketplace and installs the complete
plugin through Codex. It probes existing Chrome and prepares managed Chromium when
needed. Start a new session and invoke @geogebra-studio. Verify both skills and MCP
tool availability; a standalone SDK connection alone does not verify plugin loading.
For candidate versions, use the exact installed version or the npm `next` tag.
The packaged launcher uses a neutral npm prefix so an unpacked plugin without
node_modules does not shadow the version-pinned npm runtime. For file output, pass
the absolute user project directory in `workspace`, or use client-provided MCP roots.
Old geogebra-geometry plugins are not removed automatically. Avoid using both against
the same diagram; remove the old plugin only when the user asks.

`npx @lydt/geogebra-studio mcp` (also the no-argument default) starts only stdio MCP.
Use `doctor` for a browser-launch and built-in-cleaner check; `browser install`
prepares a usable browser. PUPPETEER_EXECUTABLE_PATH selects an explicit executable.
No GeoGebra desktop client and no GIKZ_CLI installation are required.

Default artifact creation needs Chrome and network access to official GeoGebra
assets. Browser downloads and generated HTML also need GeoGebra network assets.
Do not bypass load errors with a custom drawing. Diagnose missing browser, network,
command, and plugin-loading failures separately.

Read [visual standards](../../docs/VISUAL-STANDARD.md) for the delivered viewer and
[the regression](../../docs/TANGENT-REGRESSION.md) when diagnosing its geometry.
This release targets local Codex; it does not publish a remote endpoint or submit
to the public ChatGPT directory. No credentials are stored in the package.
