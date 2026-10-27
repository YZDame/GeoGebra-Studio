# Validation matrix

Default workflow is a standalone Skill and local HTML generator, without MCP. `npm run verify` compiles TypeScript, builds the plugin and bundled portable runtime, validates manifests, confirms no dependency installation is needed for a copied Skill and tests XML/TSQX/Asymptote/TikZ conversions. `npm run test:unit` runs the focused non-MCP unit suites.

The generated HTML loads the official GeoGebra applet over the network. `generate` itself does not validate geometry. Optional `generate --verify` and `npm run verify:math` use Chrome to check real applet execution, numerical construction properties and current-state HTML re-opening. The browser viewer scripts validate 2D/3D responsive scaling, themes, the header sidebar toggle, seven downloads and native object edits.

Do not claim browser checks passed unless they actually executed. CI PR checks are browser-free by default, with real-engine math checks available under workflow_dispatch.
