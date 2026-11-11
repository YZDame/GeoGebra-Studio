# GeoGebra Studio examples

Open a figure in the [live gallery](https://yzdame.github.io/GeoGebra-Studio/) or download its HTML and open it in a browser. The browser needs internet access to load the official GeoGebra engine. Each JSON is an editable specification for the corresponding HTML.

| 2D | Specification | What to explore |
| --- | --- | --- |
| Napoleon’s theorem | [napoleon.json](napoleon.json) | Drag a vertex and watch the triangle of centers remain equilateral. |
| Nine-point circle | [nine-point-circle.json](nine-point-circle.json) | Drag a vertex and follow the nine points and the Euler line. |
| Cycloid | [cycloid.json](cycloid.json) | Move the slider to roll a circle along the x-axis and trace its rim point. |
| Spirograph | [spirograph.json](spirograph.json) | Change the rolling circle’s radius and the pen’s distance from its center. |
| Fourier square wave | [fourier-square-wave.json](fourier-square-wave.json) | Change the number of odd harmonics and compare the partial sum with the square wave. |
| Pascal’s theorem | [pascal-theorem.json](pascal-theorem.json) | Drag the six vertices along the ellipse and watch the three opposite-side intersections stay collinear. Parallel opposite sides have no finite intersection. |
| Mandelbrot set | [mandelbrot.json](mandelbrot.json) | Drag the red parameter point to change the first twelve iterates of z ↦ z² + c. The blue region is a finite-resolution escape-time approximation with 60 iterations. |
| Golden spiral and sunflower | [golden-spiral-sunflower.json](golden-spiral-sunflower.json) | Compare growth by the golden ratio each quarter turn with seed placement at the golden angle. Use the slider to change the number of seeds. |

| 3D | Specification | What to explore |
| --- | --- | --- |
| Ruled hyperboloid | [hyperboloid-ruled.json](hyperboloid-ruled.json) | Rotate the surface to see both families of straight lines. |
| Möbius strip | [mobius-strip.json](mobius-strip.json) | Follow the single boundary through one half twist of the strip. |
| Klein bottle | [klein-bottle.json](klein-bottle.json) | Rotate the figure-eight immersion and find its self-intersection. |
| Torus knot | [torus-knot.json](torus-knot.json) | The default (2, 3) is a trefoil. Open the object sidebar to change p and q. When they share a divisor, the curve shows one component of the corresponding torus link. |
| Helicoid | [helicoid.json](helicoid.json) | Rotate the minimal surface traced by a straight line that turns while rising along the z-axis. |
| Lorenz attractor | [lorenz-attractor.json](lorenz-attractor.json) | Rotate the numerically integrated trajectory for σ = 10, ρ = 28 and β = 8/3. |

Recompute the Mandelbrot and Lorenz specifications with `node scripts/sample-showcases.cjs`. After editing a specification, generate HTML into a fresh folder. The generator does not overwrite files.

```sh
preview_dir=$(mktemp -d)
node skills/geogebra-studio/scripts/geogebra-studio.cjs generate --input "$PWD/examples/cycloid.json" --workspace "$preview_dir"
```

The portable Skill bundles the Napoleon, nine-point circle, cycloid and ruled hyperboloid specifications as templates. The [teacher walkthrough](../docs/TEACHER-QUICKSTART.md) uses [right-triangle.json](right-triangle.json).
