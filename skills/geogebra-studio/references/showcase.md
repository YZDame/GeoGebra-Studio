# Showcase templates

These JSON templates ship inside the portable Skill at `examples/` next to this `references/` folder. Prefer them when the user wants a striking demo, README hero, or short video take:

- Middle school, 2D: `<SKILL_DIR>/examples/napoleon.json` — Napoleon's theorem
- High school, 2D: `<SKILL_DIR>/examples/nine-point-circle.json` — nine-point circle and Euler line
- University, 3D: `<SKILL_DIR>/examples/hyperboloid-ruled.json` — ruled one-sheet hyperboloid
- Advanced / promotional 3D: `<SKILL_DIR>/examples/calabi-yau.json` — Fermat quintic projection inspired by Calabi–Yau popularizations

Copy a template into the workspace (or pass its absolute path to `generate`), keep free points free so dragging remains interesting, and preserve the color hierarchy. For `calabi-yau.json`, say clearly that it is a multi-patch projection of a Fermat quintic slice for visualization, not a computed Calabi–Yau metric.

After generation, use the default loopback preview workflow from `SKILL.md`. For video, record dragging `A`/`B`/`C` on the 2D examples and a slow orbit on the 3D examples.

The repository also mirrors these specs under the top-level `examples/` directory with pre-generated HTML for browsing and CI.
