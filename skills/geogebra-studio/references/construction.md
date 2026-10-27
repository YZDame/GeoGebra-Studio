# Construction guidance

Create an ordered list of GeoGebra commands. Keep free points free and dependent points explicitly dependent. Use `A=(0,0)`, `B=(4,0)`, `M=Midpoint(A,B)`, `c=Circle(A,B)` as basic examples. Use `showAxes:true` for coordinate geometry, otherwise hide axes and grid. Set `mode:"3D"` for solids.

JSON example:

```json
{
  "filename": "circle.html",
  "commands": ["A=(0,0)", "B=(4,0)", "c=Circle(A,B)"],
  "visibleLabels": ["A","B"]
}
```

The generator creates new files only and validates input. After opening, the official applet executes commands in order, then reports errors and undefined objects. Never misreport file generation as mathematical verification.

For styling, `SetColor`, `SetLineThickness`, `SetLineStyle`, `SetPointSize`, `SetCaption`, `ShowLabel`, `SetCoords`, `SetFixed`, `SetValue`, `SetVisibleInView` and `ZoomIn` are handled via the native applet API where appropriate. Use hexadecimal or normalized RGB colors. Styled objects preserve explicit weights and sizes. `ZoomIn(xmin,ymin,xmax,ymax)` defines the explicit viewport.

For 3D, optional `view3D` takes `bounds:[xmin,xmax,ymin,ymax,zmin,zmax]` and `direction:[x,y,z]`. Optional `labelOffsets` places native LaTeX labels away from crowded points. Check labels after rotation; hide coordinate plane for non-coordinate solid geometry.

For geometry fidelity compare incidences, branches, labels, tangencies and responsive resizing against the actual applet, not its JSON alone. Use existing examples in the repository for patterns; keep the generated HTML self-contained apart from GeoGebra's remotely loaded engine.
