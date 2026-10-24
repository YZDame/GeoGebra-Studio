# Contributing

Bug reports, teaching examples, translations and focused fixes are welcome. Search
existing [issues](https://github.com/YZDame/GeoGebra-Studio/issues) and
[pull requests](https://github.com/YZDame/GeoGebra-Studio/pulls) first. For a large
architecture change, discuss the intended behavior in an issue before implementation.
Small documentation fixes can go straight to a PR.

## Local setup

Use Node.js >=22.12 and npm. From a clone of this repository:

```sh
npm ci
npm run verify
npm run test:unit
```

`verify` builds the project, checks manifests, and exercises dependency-free HTML
generation. These checks require no browser. Installing the plugin is optional;
`node dist/cli.js install --local` changes your local Codex installation and needs
a fresh chat to load its skills.

Edit `src/` and `viewer/`, then build; `dist/` is generated. Keep existing MCP tool
names and response shapes compatible and stdout reserved for protocol messages.
Preserve workspace path checks and the generator's refusal to overwrite files.

## Teaching examples and mathematical checks

Add a reproducible construction JSON under `examples/`. Describe its free inputs,
dependent objects, expected properties and degenerate cases. Use the actual
GeoGebra engine to check geometry; mocked applets only test integration logic.

```sh
# Optional: resolves an existing Chrome or downloads a managed browser if needed.
node dist/cli.js browser install
npm run verify:math
```

The mathematical suite checks the right-triangle example at four configurations
and the tangent example at 24 positions, using GeoGebra expressions with absolute
tolerance 1e-7. It rejects undefined/nonfinite values and includes a deliberately
false property as a negative control. Output lives in `output/verification/math/`;
a success report is written only after all checks pass. Internet access is needed
for the official applet. Samples are regression evidence, not a theorem proof.

For viewer changes, inspect the rendered result, labels, dragging and current-state
exports as well. For MCP changes, run `npm run verify:mcp`. Report exactly what
was checked and what remains unverified. See [the teacher walkthrough](docs/TEACHER-QUICKSTART.md).

## Pull requests

Create a branch (or fork if you lack write access), keep the change focused, and
explain the user-visible problem, resulting behavior and validation. Include a
rendered screenshot for a visual change. Avoid committing generated test output.
PR checks run the browser-free acceptance suite; the network-dependent math suite
can be run manually from GitHub Actions.

## License and attribution

`package.json` declares the combined distribution GPL-2.0-or-later; see [LICENSE](LICENSE).
[LICENSE-MIT](LICENSE-MIT) preserves the original MCP copyright notice; it does not
declare the whole current distribution MIT. Preserve the notices in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and `gikz/` when editing or copying
those components. The official applet is loaded separately; this repository does
not bundle an offline GeoGebra engine or change its terms.
