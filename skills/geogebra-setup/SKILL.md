---
name: geogebra-setup
description: Install or diagnose the skills-first GeoGebra HTML workflow; Chrome and MCP are optional automation features.
---

The default plugin contains three skills, a lightweight HTML generator, the viewer
and bundled Gikz. Node >=22.12 is required. Install a published version with
`npx @lydt/geogebra-studio@<VERSION> install`; for a built checkout use
`node <CHECKOUT>/dist/cli.js install --local`.

Installation registers the plugin and skills without starting MCP, probing Chrome,
or downloading Chromium. Start a new Codex chat to load changed installed skills.
For local authoring, build first. Local installation copies built files to a stable
location and does not install dependencies there. `install --local` requires a fresh
installation target; use an isolated CODEX_HOME for acceptance tests.

From the installed plugin root, `node dist/cli.js doctor` checks bundled generation
assets and Gikz without a browser. Use geogebra-construct to generate HTML and open
it in the Codex browser panel. A successful generator run does not establish applet
execution: diagnose page network/loading and command errors in the visible page.
If file URLs fail, serve the user project over loopback and open its HTTP URL.

Optional background automation uses `generate ... --verify`. Only that path needs
an external Chrome runtime. `browser install` probes Chrome or downloads managed
Chromium; PUPPETEER_EXECUTABLE_PATH selects a specific executable.

Legacy integrations may explicitly start `node dist/cli.js mcp`; npm installs
include its dependencies. An unpacked dependency-free plugin needs runtime dependencies
installed before optional MCP/Chrome use. `mcp.optional.json` provides an opt-in
configuration; default `mcp.json` and `.mcp.json` have no servers.
Do not automatically enable MCP or remove older plugins.

Read [visual standards](../../docs/VISUAL-STANDARD.md) and
[the tangent regression](../../docs/TANGENT-REGRESSION.md) as relevant.
The HTML is local but GeoGebra engine assets require internet. No API key,
GeoGebra desktop app or external Gikz installation is required.
