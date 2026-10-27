# A first classroom construction

This walkthrough uses a right triangle to explore the Pythagorean relation and
the midpoint of the hypotenuse（斜边中点）as the circumcenter（外心）.
No programming experience with MCP is needed. Use Node.js >=22.12 and a network
connection for GeoGebra's engine. [中文教程](TEACHER-QUICKSTART.zh-CN.md)

## Generate the page

From the repository root, install dependencies and build once:

```sh
npm ci
npm run build
mkdir -p output/teacher-demo
node dist/cli.js generate --input "$PWD/examples/right-triangle.json" --workspace "$PWD/output/teacher-demo"
```

The complete input is [examples/right-triangle.json](../examples/right-triangle.json).
It defines A=(0,0), B=A+(b,0), C=A+(0,h), initially b=4 and h=3;
M is the midpoint of BC and the circle has center M and passes through B.
The output JSON contains `success: true`, the absolute `filename` ending in
`output/teacher-demo/right-triangle.html`, `execution: "viewer"`,
`requiresNetwork: true`, `engineVerified: false` and `renderVerified: false`.
Those last two flags mean geometry has not yet executed.

Open that HTML in the client browser panel or an ordinary browser. If local file
navigation is unavailable, keep this loopback server running in another terminal:

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory "$PWD/output/teacher-demo"
```

Open [the local page](http://127.0.0.1:8765/right-triangle.html). Use another port if
8765 is occupied. Stop the server with Ctrl+C after class.

![The generated construction running in the official applet](images/right-triangle.png)

## Explore and verify

Open the object editor with the upper-left button. Change b or h, for example to
b=3, h=4. Drag A to translate the figure; B and C follow their definitions.
Ask students what stays constant and what changes. With the initial lengths:

- AB=4, AC=3, BC=5 and AB²+AC²=BC².
- AB is perpendicular to AC; angle BAC is 90°.
- MA=MB=MC=2.5, so A, B and C all lie on the circle.

Try b=1.5, h=2 and b=8, h=6. Keep both lengths positive; a zero value collapses
the triangle and its angle is undefined. Negative values reverse orientation and
are outside this introductory exercise. Dragging and numerical measurements
support exploration; students still need a proof of the general statements.

If browser developer tools are available, `window.geogebraStudio.status` should
be `"ready"`. `"error"` includes a failed-command index; loading that never finishes
may indicate blocked engine resources. Inspect the actual diagram and label layout.

## Save for the next lesson

Download **current HTML** or **GGB** from the upper-right menu before closing.
Reopen the download to check that the changed lengths survived. Edits in the applet
do not update the original JSON or HTML on disk. PNG/PDF exports suit worksheets;
TikZ uses native PGF and the bundled Gikz cleaner and should be compiled and checked
in your own LaTeX document.

To regenerate from JSON, use a fresh output name:

```sh
node dist/cli.js generate --input "$PWD/examples/right-triangle.json" --workspace "$PWD/output/teacher-demo" --output right-triangle-v2.html
```

For automated mathematical checks, build first, then run `npm run verify:math`
with Chrome available. See [CONTRIBUTING.md](../CONTRIBUTING.md) for setup and
the distinction between browser-free checks and real-engine numerical checks.
