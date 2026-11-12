# Agent instructions — GeoGebra Studio

Project: a portable Agent Skill (`skills/geogebra-studio/SKILL.md`), an optional Codex Plugin wrapper, and a real DeepSeek Harness plugin (`plugins/dsh-geogebra-studio/`) that registers tools and contributes the skill. MCP transport has been removed.

Core: `src/studio/generate.ts` validates the JSON specification and generates a local HTML via `src/export/html.ts` and `viewer/main.js`. `src/export/semantic.ts` parses GeoGebra XML and exports TSQX/Asymptote; `src/export/gikz.ts` handles cleaned TikZ. `src/studio/artifact.ts` is an **optional** browser/Chrome validation path, not default. The browser loads the official GeoGebra engine from its CDN.

Build: `npm run build` compiles TypeScript, bundles XML parsing, builds the viewer, regenerates Plugin manifests, packages a dependency-free Skill runtime into `skills/geogebra-studio/runtime`, and bundles the DSH plugin runtime into `plugins/dsh-geogebra-studio/runtime`. The generated runtimes are committed so GitHub-directory installs work without a build, not only npm tarballs.

Checks: `npm run verify` (includes the DSH plugin contract and tool check), `npm run test:unit`, `npm run verify:math` (optional real engine). Preserve mathematical relations, export provenance, workspace path confinement and non-overwrite semantics in both the CLI and the plugin tools.

Viewer standard: left sidebar-toggle in header; theme, light/dark, downloads on the right; controls outside the canvas. Keep responsive equal-axis scale, 2D/3D perspectives, native object editing, all seven viewer downloads, editable HTML reopen and Gikz cleanup.

Never reintroduce MCP SDK/server/tool registration. No separate backend or database. Keep README.en/zh-CN/zh-TW commands consistent with the actual released version, distinguishing proposed from published versions.
