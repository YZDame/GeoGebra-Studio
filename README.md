# GeoGebra Studio

Describe a mathematical construction, generate editable GeoGebra HTML, and open it
in the Codex browser panel to inspect, drag points, edit objects and export.

The default workflow needs no MCP server or separate Chrome installation. The
page runs the official GeoGebra applet and requires internet for its engine assets.

[中文说明](README.zh-CN.md)

## Install and use

Requires Node.js >=22.12. Install the published skills-first release with
`npx @lydt/geogebra-studio@0.4.0 install`. For local authoring run `npm ci`,
`npm run build`, then `node dist/cli.js install --local`.
Installation registers skills without preparing Chrome or starting MCP. Start a
new Codex chat to load installed skills.

Ask Codex to create a diagram and open it in the right-side browser panel. The skill
writes a JSON spec and runs the bundled generator from the installed plugin root:

```sh
node dist/cli.js generate --input /absolute/project/diagram.json --workspace /absolute/project
```

Example spec:

```json
{
  "commands": ["A=(0,0)", "B=(4,0)", "c=Circle(A,B)"],
  "visibleLabels": ["A", "B"],
  "filename": "circle.html"
}
```

The generator writes new files only and does not execute geometry. Open the result
in the browser panel; if file URLs are unsupported, serve the user project on
loopback and open its HTTP URL. The viewer executes commands and reports failed
steps, undefined visible objects and equal-axis checks. Inspect the actual figure
before claiming mathematical or visual correctness.

## Use another agent or browser

The JSON-to-HTML generator does not depend on Codex. From a built checkout, run
the same `generate` command above, then open the returned HTML in a modern browser.
An agent needs file-writing and shell access; native plugin/skill installation in
other agents is not verified. For optional MCP configuration, see
[mcp.optional.json](mcp.optional.json). Node >=22.12 remains required.

## Classroom example

Follow the [teacher walkthrough](docs/TEACHER-QUICKSTART.md)
([中文](docs/TEACHER-QUICKSTART.zh-CN.md)) to turn
[a right-triangle JSON](examples/right-triangle.json) into an editable diagram,
change its dimensions, check its properties and save the current construction.

![Right triangle and circumcircle rendered by GeoGebra](docs/images/right-triangle.png)

## Edit and save

Drag free points and use the upper-left button to open the native object editor.
The upper-right controls offer themes and GGB, HTML, PNG, SVG, PDF, XML and TikZ
downloads. TikZ uses native PGF followed by bundled Gikz.

**Edits do not update the original HTML or JSON. Download current HTML/GGB before
refreshing or closing.** Downloaded HTML embeds current packed GGB and preserves edits.

`window.geogebraStudio.status` exposes loading/executing/ready/error, failed commands
and initial checks. `await window.geogebraStudio.snapshot()` reads current GGB,
construction XML and checks directly from the visible page.

## Optional automation

`generate ... --verify` opts into background Chrome execution, packed-GGB round-trip
verification and a preview PNG. Prepare a browser with `node dist/cli.js browser install`
only when this workflow is needed.

Legacy MCP tools remain available through `node dist/cli.js mcp`. Default plugin
manifests register no MCP servers; `mcp.optional.json` contains an opt-in configuration.
An unpacked plugin runs the generator without node_modules; optional backend
features require installed runtime dependencies.

Run `npm run verify` and `npm run test:unit` for default checks, and
`npm run verify:mcp` for optional MCP compatibility. `doctor` checks the generator
and Gikz without launching a browser.

See [CONTRIBUTING.md](CONTRIBUTING.md) for local checks, mathematical regression
tests and contribution guidelines.

Independent community project, unaffiliated with GeoGebra. The combined package
is GPL-2.0-or-later; original MIT notices are retained. See [LICENSE](LICENSE),
[LICENSE-MIT](LICENSE-MIT) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
The generated viewer requires network access; an offline engine is not bundled.
