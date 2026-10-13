# Two circles and two tangents: regression and lessons

Gamma: x²+y²=25; omega: (x−3)²+y²=64/25. O=(0,0), I=(3,0), A is movable on
Gamma. Two tangent lines from A to omega meet Gamma again at B and C.
See examples/tangent-construction.json for the exact ordered commands and captions.

The other-intersection definition must test distance from A and select the alternate
intersection if needed. Intersect(...,2) alone fails as A moves and branches swap.
At A=(5,0), the other intersections are (1.4,±4.8). Test at 24 angles: B,C lie on
Gamma, differ from A, and the distance from I to both tangent lines is 1.6.

## Failures that must not return

- Apparent ellipses caused by unequal display scales, despite correct circle objects.
- A fixed-size native canvas stretched in one axis, or a canvas not filling its host.
- Labels rendered as ordinary text or malformed TeX after double escaping.
- Native Algebra View visible but unable to submit edits because UI initialized off.
- A .ggb containing base64 text instead of decoded ZIP bytes (PK signature).
- A raw PGF download bypassing the Gikz pipeline.
- Gikz dropping native lines because of whitespace after draw, dropping nested
  mathit labels, or dropping unlabelled point markers.
- SDK-only success described as proof of installed plugin tool availability.
- npx treating an unpacked npm plugin as a locally installed executable without dependencies.
- Files saved into the plugin cache instead of the user workspace. Pass workspace
  explicitly and check returned paths against the project directory.

## Acceptance evidence

Reopen the final packed HTML and GGB. Check multiple viewport sizes and 24 A positions.
Edit Gamma to x²+y²=36 through the actual native sidebar; verify A and dependent
objects update, and the newly exported cleaned TikZ contains the radius-6 circle.
Compare browser cleanup against MCP/CLI output on the SAME native PGF. Compile
cleaned .tex and inspect it. Test all seven downloads and another HTML round trip.
Keep test artifacts under output/verification; tests must not overwrite user examples.
