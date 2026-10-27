# GeoGebra Studio — portable Skill architecture

The primary product is `skills/geogebra-studio/`, a single Agent Skill that includes documentation, a Node.js launcher and generated standalone runtime assets. `plugin.json` is a transport-free Agent Plugin distribution manifest; `.codex-plugin/plugin.json` provides optional Codex integration. No MCP Server, MCP Apps UI or transport is required or distributed.

## Construction and local artifact

Agent → construction JSON → skill-local `generate` CLI → self-contained viewer HTML (with external official GeoGebra engine assets) → browser inspection → current-state downloads. HTML generation itself does not execute mathematical commands; the official applet executes them after loading. Use `generate --verify` in a built checkout with optional Chrome dependencies for independent browser-side verification.

## Source exports

Viewer offers current-state GGB, HTML, PNG, SVG, PDF, XML, TikZ. Native GeoGebra PGF is cleaned by the bundled Gikz implementation. GeoGebra XML contains construction semantics; `src/export/semantic.ts` converts a validated subset to Asymptote or mixed TSQX/Asymptote through the local CLI, rejecting unsupported relations. No part of this flow needs MCP.

## Packaging and quality

The code in `src/`, `viewer/` and `gikz/` is the maintenance source of truth. The build copies a generated runtime into the standalone Skill. CI verifies dependency-free copied-Skill execution and semantic export, and optional actual GeoGebra/Chrome tests check geometry, re-open, 3D, responsive layout and downloads. GitHub Skills installation requires the bundled runtime files to be present in the repository tree. See `docs/VALIDATION.md` and `docs/VISUAL-STANDARD.md`.
