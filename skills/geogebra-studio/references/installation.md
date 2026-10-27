# Installation and troubleshooting

Use an Agent Skills-compatible installer against `YZDame/GeoGebra-Studio`, selecting `geogebra-studio`, or copy the entire `skills/geogebra-studio` directory (not just SKILL.md) to the agent's skills directory.

The GitHub checkout must include `scripts/geogebra-studio.cjs` and `runtime/dist/cli.js` alongside this SKILL.md. Node.js >=22.12 is required; check by running `node "<SKILL_DIR>/scripts/geogebra-studio.cjs" doctor`. If runtime assets are absent, use a packaged npm/Plugin distribution or build from a checkout using `npm ci && npm run build`; do not silently claim installation succeeded.

No MCP or Chrome service is needed. HTML loading requires internet access to GeoGebra. A file:// URL may be unsupported in some embedded browsers; serve only on localhost and open an HTTP URL. A browser without scripting access can still display the diagram, but the agent cannot claim it verified the visual output.

For the Codex Plugin convenience installer, use the published npm version's `install` command; after install restart the client session. This is an optional distribution mode rather than a dependency of Agent Skills.
