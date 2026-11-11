# Showcase constructions

Styled demo specs for README, Skill templates, and video capture. Each pair is a JSON specification plus the generated HTML.

| Level | File | Why it looks good |
| --- | --- | --- |
| Middle school | [`napoleon.json`](napoleon.json) | Napoleon's theorem: three outer equilateral triangles and a living inner equilateral while vertices drag |
| High school | [`nine-point-circle.json`](nine-point-circle.json) | Nine-point circle and Euler line: layered classical geometry with a clear hierarchy |
| University | [`hyperboloid-ruled.json`](hyperboloid-ruled.json) | One-sheet hyperboloid with both ruling families: rotate the 3D view for a cinematic shell |
| Advanced demo | [`calabi-yau.json`](calabi-yau.json) | Fermat-quintic projection patches inspired by popular Calabi–Yau imagery (not a Ricci-flat metric) |

Regenerate HTML after editing JSON (the generator never overwrites):

```sh
rm -f examples/napoleon.html
node dist/cli.js generate --input "$PWD/examples/napoleon.json" --workspace "$PWD/examples"
```

Teacher walkthrough still uses [`right-triangle.json`](right-triangle.json). Regression fixtures include [`tangent-construction.json`](tangent-construction.json) and [`cube-3d.json`](cube-3d.json).
