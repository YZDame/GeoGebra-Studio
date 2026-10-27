# Changelog

## 0.5.0 (planned, not published)

- Consolidate three skills into a single independently distributable GeoGebra Studio Agent Skill.
- Remove MCP transport, tool registration, MCP Apps and associated dependencies while retaining semantic source exports and Gikz.
- Align the algebra-sidebar button to the left of the external viewer toolbar; theme and downloads remain right aligned.
- Add cross-agent installation instructions and English, simplified Chinese and traditional Chinese READMEs.
- Preserve local standalone HTML/GGB, seven viewer downloads, 2D/3D, optional real-engine checks and strict TSQX/Asymptote conversion.
- Breaking change: legacy MCP clients/tools are no longer supported. Stay on 0.4.0 if MCP transport is required.

# Unreleased

- Default to a dependency-free HTML generator and execution in the Codex browser panel.
- Stop registering MCP or preparing Chrome during default plugin installation.
- Add `generate --input ... --workspace ...`, with opt-in `--verify` for Chrome checks.
- Extract the viewer script; report failed commands, undefined objects and page-local snapshots.
- Preserve current edits through packed-GGB HTML downloads. Keep legacy MCP opt-in.
- Replace the plugin icon with the supplied five-node graphic.

# Changelog

All notable changes to this project will be documented in this file.

## 0.3.1 — 2026-10-11

- Add runtime discovery and invocation for public GeoGebra Apps API methods.
- Add one-shot callback waiting and persistent listener callback queues.
- Require explicit opt-in for Apps API methods that replace or clear construction data.
- Expand the core profile from 16 to 19 tools and document API bridge boundaries.
- Package the skills and local stdio server as an installable local Codex plugin.

## [0.1.2] - 2026-03-08

### Security

- Patched high-severity `minimatch` vulnerabilities by constraining transitive resolution with `overrides` (`minimatch@^9.0.7`).
- Refreshed lockfile via `npm audit fix` to pick up patched transitive packages, including `brace-expansion` versions from safe ranges.


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
