# GeoGebra Studio architecture

GeoGebra Studio is a local Codex plugin with an official MCP SDK server, three agent skills, a native GeoGebra HTML viewer, and the fused Gikz source/core. Portable plugin identity and MCP transport live in the root `plugin.json` and `mcp.json`; `.codex-plugin/plugin.json` and `.mcp.json` are generated compatibility files. `scripts/build-plugin.cjs` regenerates all manifests from `package.json`.

## Artifact flow

The default path is intentionally narrow: `geogebra_build_artifact` sends ordered commands to an isolated official GeoGebra applet, rejects undefined visible objects, packs the editable GGB into the local HTML, reopens the delivered file, checks object count and equal scales, and returns an interactive preview plus `constructionXml`. `geogebra_export_source` takes that XML for TikZ, Asymptote, or TSQX, so each export starts from the exact same construction data. The `geogebra_create_html` and `geogebra_export_html` tools remain advanced compatibility routes outside the default core profile.

The editable GGB/XML is the canonical construction. The HTML loads GeoGebra's official `deployggb.js` and needs network access. Its theme and download controls are plugin presentation around the official applet. SVG, PDF, PNG and TikZ are static views. All TikZ exits run native GeoGebra PGF through the shared Gikz core; failures stop export. Gikz provenance and license are recorded in `gikz/PROVENANCE.md`.

## Supported exports

The viewer exports current-state GGB, PNG, SVG, TikZ, PDF, XML and HTML. TikZ is a cleaned static drawing; dependency semantics stay in GGB/XML. Asymptote and mixed TSQX/Asymptote use the documented semantic subset. The actual supported MCP protocol range follows the installed official SDK rather than a hard-coded latest-date claim.

See [VISUAL-STANDARD.md](VISUAL-STANDARD.md), [TANGENT-REGRESSION.md](TANGENT-REGRESSION.md), and [VALIDATION.md](VALIDATION.md).
