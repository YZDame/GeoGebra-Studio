# Changelog

All notable changes to this project will be documented in this file.

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
