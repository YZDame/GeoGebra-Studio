# Contributing

GeoGebra Studio is a portable Agent Skill and local GeoGebra HTML generator. Contributions should preserve mathematical semantics and the absence of an MCP transport.

## Development

Node.js >=22.12. Run `npm ci`, `npm run verify`, and `npm run test:unit`. `npm run build` creates the standalone Skill runtime in `skills/geogebra-studio/runtime/`. Do not hand-edit generated runtime artifacts; change `src/`, `viewer/`, or `gikz/` and rebuild.

For optional real-engine coverage, prepare Chrome with `node dist/cli.js browser install` and run `npm run verify:math`, `node scripts/verify-artifact.cjs`, `node scripts/verify-viewer.cjs` or `npm run verify:3d`. These need internet to load official GeoGebra resources. Test exported TSQX/Asymptote against real compilers when available, without treating successful compilation as proof of mathematical correctness.

## Invariants

- Keep the Skill installable from a copy of its own directory, with no local node_modules, MCP server or separate npm package required.
- Keep project files confined to the user workspace and refuse overwriting existing files.
- Preserve the native GGB/XML semantic construction; export static source with explicit supported subsets and warnings.
- Preserve seven viewer downloads, native geometry editing, 2D/3D, responsive equal coordinate axes and edited HTML reopening.
- Keep theme and sidebar controls outside the GeoGebra canvas and accessible by keyboard.
- Keep readmes in English, simplified Chinese and traditional Chinese synchronized.

File a bug report including the construction JSON, actual output and environment. Avoid sharing private student data, credentials or sensitive local paths.
