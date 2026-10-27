# Agent instructions — GeoGebra Studio

Project: a single portable Agent Skill (`skills/geogebra-studio/SKILL.md`) and optional Codex Plugin wrapper. MCP transport has been removed.

Core: `src/studio/generate.ts` validates the JSON specification and generates a local HTML via `src/export/html.ts` and `viewer/main.js`. `src/export/semantic.ts` parses GeoGebra XML and exports TSQX/Asymptote; `src/export/gikz.ts` handles cleaned TikZ. `src/studio/artifact.ts` is an **optional** browser/Chrome validation path, not default. The browser loads the official GeoGebra engine from its CDN.

Build: `npm run build` compiles TypeScript, bundles XML parsing, builds the viewer, regenerates Plugin manifests, and packages a dependency-free Skill runtime into `skills/geogebra-studio/runtime`. The runtime must also be present in the GitHub-distributed Skill, not only in npm tarballs.

Checks: `npm run verify`, `npm run test:unit`, `npm run verify:math` (optional real engine). Preserve mathematical relations, export provenance, workspace path confinement and non-overwrite semantics.

Viewer standard: left sidebar-toggle in header; theme, light/dark, downloads on the right; controls outside the canvas. Keep responsive equal-axis scale, 2D/3D perspectives, native object editing, all seven viewer downloads, editable HTML reopen and Gikz cleanup.

Never reintroduce MCP SDK/server/tool registration. No separate backend or database. Keep README.en/zh-CN/zh-TW commands consistent with the actual released version, distinguishing proposed from published versions.
