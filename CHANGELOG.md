# Changelog

## [0.5.0] — 2026-10-29

### Breaking change: portable Agent Skill

- Combine `geogebra-construct`, `geogebra-setup` and `geometry-export` into one independently installable `geogebra-studio` Skill. Include the local generator, browser viewer, Gikz and XML parser with the Skill.
- Remove the MCP server, tool registry, MCP Apps and MCP dependencies. Legacy MCP integrations must stay on version 0.4.0.
- Preserve native 2D/3D interactive GeoGebra HTML, the Algebra View editor, themes, current-state GGB/HTML downloads, PNG/SVG/PDF/XML and Gikz-cleaned TikZ.
- Keep strict GeoGebra XML-to-Asymptote and mixed TSQX/Asymptote exports through a local CLI.
- Put the Algebra View toggle at the left side of the external toolbar, with theme and download controls on the right. Compact the download control.
- Add nine-language documentation, project badges, cross-agent installation instructions and real-browser mathematical regression coverage.
- Continue loading the official GeoGebra engine over the network; an offline engine is not bundled.

### Upgrade

- Generic Agent Skills: `npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio`
- Optional Codex Plugin: `npx @lydt/geogebra-studio@0.5.0 install`
- Previous MCP callers: pin `@lydt/geogebra-studio@0.4.0`; do not upgrade without migrating to the local Skill/CLI.

## [0.4.0] — 2026-10-15

- Fix GeoGebra scripting actions that successfully update viewport, style, coordinates or display state but return no object labels.
- Route supported actions to native applet setters with validation.
- Preserve explicit colours and sizing under theme changes; improve examples and mathematical rendering checks.

## 0.3.1 — 2026-10-11

- Add runtime discovery and invocation for public GeoGebra Apps API methods.
- Add one-shot callback waiting and persistent listener callback queues.
- Require explicit opt-in for Apps API methods that replace or clear construction data.
- Expand the core profile from 16 to 19 tools and document API bridge boundaries.
- Package the skills and local stdio server as an installable local Codex plugin.

## 0.2.0 — 2026-10-11

- Replace handwritten MCP framing with the official SDK, validation, resources,
  prompts, structured results, serialized construction access, and loopback HTTP.
- Add a 16-tool core profile while retaining all existing tools by default.
- Add browser-independent HTML generation and current-construction HTML packaging.
- Use native asynchronous GGB/SVG/PDF exports; correct packed base64 imports.
- Remove construction-mutating health probes and preserve equal-scale auto fitting.
- Add XML semantic snapshots, bounded TikZ/Asymptote/mixed TSQX export, and explicit
  unsupported-object/fallback reports.
- Integrate a separately configured Gikz CLI without vendoring GPL code.
- Bundle portable/Codex plugin manifests, three skills, and an MCP Apps preview.
- Update Puppeteer and require Node >=22.12.0; use built-in UUID generation.
- Document actual SDK protocol coverage and the 2026-07-28 migration gap.

## [0.1.2] - 2026-03-08

### Security

- Patched high-severity `minimatch` vulnerabilities by constraining transitive resolution with `overrides` (`minimatch@^9.0.7`).
- Refreshed lockfile via `npm audit fix` to pick up patched transitive packages, including `brace-expansion` versions from safe ranges.
