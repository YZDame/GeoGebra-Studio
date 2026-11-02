# Installation and troubleshooting

Use an Agent Skills-compatible installer against `YZDame/GeoGebra-Studio`, selecting `geogebra-studio`, or copy the entire `skills/geogebra-studio` directory (not just SKILL.md) to the agent's skills directory.

The GitHub checkout must include `scripts/geogebra-studio.cjs` and `runtime/dist/cli.js` alongside this SKILL.md. Node.js >=22.12 is required; check by running `node "<SKILL_DIR>/scripts/geogebra-studio.cjs" doctor`. If runtime assets are absent, use a packaged npm/Plugin distribution or build from a checkout using `npm ci && npm run build`; do not silently claim installation succeeded.

No MCP or Chrome service is needed. HTML loading requires internet access to GeoGebra. For agent clients, use the bundled `preview --input "<ABS_HTML>" --workspace "<ABS_WORKSPACE>"` command and open its returned loopback HTTP URL in a real browser pane. Keep the preview process running; stop it when no longer needed. It serves one HTML snapshot, so restart it after modifying that file. A static HTML file-preview pane can restrict external scripts even if a regular browser works. The preview command does not override client policies: when an access check rejects navigation, report that restriction instead of switching transports or tools to evade it.

`GeoGebra failed to load` is an engine bootstrap failure; inspect network/CSP errors in the intended browser. A terminal CDN check cannot prove client access. `Command N failed` means the engine loaded and the construction must be checked instead. A browser without scripting access can display the diagram, but the agent cannot claim a programmatic readiness check. Always state when client rendering has not been verified.

For the Codex Plugin convenience installer, use the published npm version's `install` command; after install restart the client session. This is an optional distribution mode rather than a dependency of Agent Skills.
