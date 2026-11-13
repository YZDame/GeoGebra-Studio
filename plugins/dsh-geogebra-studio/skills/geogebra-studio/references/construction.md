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

Sliders always show a label beside the control after the viewer finishes styling. Give the text with `SetCaption` or `captionOverrides`. Chinese is a native caption, not a LaTeX text object, so it stays next to a screen-positioned slider. A slider with no caption shows its object name. `ShowLabel` is accepted and is not required. Computed numbers that are not sliders stay unlabeled. When both are set, `captionOverrides` wins.

```json
{
  "filename": "slider.html",
  "commands": [
    "a=Slider(3,6,0.1,1,180,false,true,false,false)",
    "SetCaption(a,\"半长轴 a\")",
    "SetCoords(a,70,40)",
    "c=Slider(0.5,3,0.1,1,180,false,true,false,false)"
  ],
  "captionOverrides": { "c": "半焦距 c" }
}
```

`a` shows the `SetCaption` text. `c` shows the `captionOverrides` text. A slider with neither shows its name.

For 3D, optional `view3D` takes `bounds:[xmin,xmax,ymin,ymax,zmin,zmax]` and `direction:[x,y,z]`. Optional `labelOffsets` places native LaTeX labels away from crowded points. Check labels after rotation; hide coordinate plane for non-coordinate solid geometry.

For geometry fidelity compare incidences, branches, labels, tangencies and responsive resizing against the actual applet, not its JSON alone. Use existing examples in the repository for patterns; keep the generated HTML self-contained apart from GeoGebra's remotely loaded engine. For visually rich demos (Napoleon, nine-point circle, ruled hyperboloid, cycloid), see [showcase templates](showcase.md).

Use descriptive names such as `triangle=Polygon(A,B,C)` and `circumcircle=Circle(A,B,C)`. A polygon also creates side objects (often `a`, `b`, `c`); reusing a side label for a circle can redefine or remove dependent objects before later styling commands run.

## Fast path

Start from `examples/*.json` when the figure resembles one; the templates already carry the color hierarchy and label conventions. Build once, then read the result instead of guessing: a live host canvas reports its own status, failed command, undefined visible objects and equal-axis check. Do not rebuild for speculative cosmetic changes and do not start a browser per iteration; one visual confirmation at the end is enough.

## Names GeoGebra reserves

`deg`, `pi`, `e` and `i` are built-in constants. `deg=Slider(...)` is silently renamed (`a_1`), and the next `SetValue(deg,...)` then fails with "Action target does not exist". Use `ang`, `theta`, `k` or another free name. Angle sliders report object type `angle`, not `numeric`; they still keep their caption.

## Label collisions

GeoGebra nudges every label about 10 px right and above its object. A line or chord through a labelled point therefore crosses that label: a focal chord through a focus, a tangent through its contact point, a chord through a vertex. Move that single label with `labelOffsets` rather than drawing a text object:

```json
{ "labelOffsets": { "F_2": [0.05, -0.45] } }
```

2D offsets are world units added to the label anchor; 3D offsets use all three components. The label stays attached to the object and follows it when it moves.
