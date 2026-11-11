# Installation and troubleshooting

Use an Agent Skills-compatible installer against `YZDame/GeoGebra-Studio`, selecting `geogebra-studio`, or copy the entire `skills/geogebra-studio` directory (not just SKILL.md) to the agent's skills directory.

The GitHub checkout must include `scripts/geogebra-studio.cjs` and `runtime/dist/cli.js` alongside this SKILL.md. Node.js >=22.12 is required; check by running `node "<SKILL_DIR>/scripts/geogebra-studio.cjs" doctor`. If runtime assets are absent, use a packaged npm/Plugin distribution or build from a checkout using `npm ci && npm run build`; do not silently claim installation succeeded.

No MCP or Chrome service is needed. When the agent client can open loopback URLs, run the bundled `preview --input "<ABS_HTML>" --workspace "<ABS_WORKSPACE>"` command by default. Open the returned URL in the browser sidebar or tab and put it first in the reply as a clickable interactive preview link. Keep the process running after the reply. It serves one HTML snapshot, so restart it after modifying that file. Stop it when the preview is no longer needed. A static HTML file-preview pane can restrict external scripts even if a regular browser works; do not treat that pane as browser verification. The preview command does not override client policies: when an access check rejects navigation, report that restriction instead of switching transports or tools to evade it.

Include the generated HTML as a separate download. If loopback preview is unavailable, tell the user to download the HTML and open it directly in Chrome, Safari, or another regular browser. Both viewing paths require access to the official GeoGebra engine online. With the Skill installed, HTML generation itself can run offline. Confirm `window.geogebraStudio.status === "ready"` and the visible drawing before claiming successful rendering.

`GeoGebra failed to load` is an engine bootstrap failure; inspect network/CSP errors in the intended browser. A terminal CDN check cannot prove client access. `Command N failed` means the engine loaded and the construction must be checked instead. A browser without scripting access can display the diagram, but the agent cannot claim a programmatic readiness check. Always state when client rendering has not been verified.

For the Codex Plugin convenience installer, use the published npm version's `install` command; after install restart the client session. This is an optional distribution mode rather than a dependency of Agent Skills.
