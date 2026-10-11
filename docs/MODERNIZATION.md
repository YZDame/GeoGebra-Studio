# Modernization audit (2026-10-11)

## Starting points

GeoGebra MCP is the implementation repository. Gikz is a separate reference checkout
at revision `390460600c5ad4b20e3af8912dfe6a412de7ac1b`.
Existing tool names and text responses remain compatible.

The original server hand-rolls JSON-RPC and negotiates only MCP 2024-11-05.
SVG calls a callback-based API synchronously; PDF prints a browser page rather
than exporting the graphics view; GGB uses synchronous getBase64. Initialization
probes create extra objects. These can be simplified with official APIs.

## Implementation stages

1. Record the audit and boundaries (this document).
2. Official MCP SDK transport, validation, serialized construction access, resources,
   prompts, and optional Streamable HTTP. Preserve existing tools.
3. Browser-independent HTML creation, native callback exports, semantic snapshot,
   TikZ/Asymptote/TSQX subset exporters, and optional external Gikz cleanup.
4. Plugin manifests, focused construction/export skills, examples, validation,
   and documentation of unsupported semantics and deployment requirements.

## Export contract

A `.ggb` is a ZIP archive returned by getBase64; XML alone is not a `.ggb`.
HTML uses deployggb.js and GGBApplet and needs network access for GeoGebra assets.
Native PNG/SVG/PDF are rendered exports, not editable construction definitions.
Construction XML and command inputs/outputs are retained as provenance.
Semantic converters support an explicit subset and report unsupported objects
and coordinate fallbacks. They must never claim arbitrary lossless conversion.
AI skills receive original definitions, styles, and warnings for the remainder.

Gikz derives from GPL upstream. Invoke a separately installed, explicitly configured
CLI; do not vendor its implementation or change this repository's MIT license.

## Current official references

- https://geogebra.github.io/docs/reference/en/GeoGebra_Apps_API/
- https://geogebra.github.io/docs/reference/en/GeoGebra_App_Parameters/
- https://modelcontextprotocol.io/specification/latest (resolved to 2026-07-28)
- https://developers.openai.com/plugins/build/mcp-server
- https://developers.openai.com/plugins/build/app-quickstart
- https://developers.openai.com/plugins/build/plugins

Use SDK negotiation rather than asserting support through a hardcoded date.
Local plugin packaging is distinct from public directory submission: the latter
requires a deployed HTTPS endpoint and platform review. No deployment or npm
publication is part of this source modernization.

## Protocol version boundary

Installed official SDK 1.32.1 advertises up to 2025-11-25. It does **not**
implement the latest 2026-07-28 revision. That revision removes initialization
and protocol sessions, adds server/discover, per-request version/capability
metadata, resultType, cache hints, and method/name HTTP headers. Do not merely
change a date string to claim conformance. This implementation uses the SDK's
actual supported versions and stateless HTTP mode; migrate to a supporting SDK
when available, with discovery and header conformance tests.

Reference: https://modelcontextprotocol.io/specification/2026-07-28/changelog
