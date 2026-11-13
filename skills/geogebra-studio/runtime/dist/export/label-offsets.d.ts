/**
 * Per-object label placement for the viewer.
 *
 * GeoGebra places a label a few pixels right and above its object. That fixed
 * nudge can land on top of a line that passes through the labelled point (a
 * focal chord through a focus, for example). `labelOffsets` moves individual
 * labels without turning them into hand-placed text objects, so they stay
 * attached to the object and follow it when it moves.
 *
 * Offsets are authored in world units and added to the label anchor. 2D only
 * reads the first two components; 3D reads all three.
 */
export type LabelOffset = [number, number] | [number, number, number];
export declare function isLabelOffset(value: unknown): value is LabelOffset;
/** 2D labels: the authored (x, y) offset, else the viewer's default nudge. */
export declare function labelOffset2D(offsets: Record<string, LabelOffset> | undefined, name: string, dx: number, dy: number): [number, number];
/** 3D labels: the authored vector, else the radial fallback from the centroid. */
export declare function labelOffset3D(offsets: Record<string, LabelOffset> | undefined, name: string, fallback: [number, number, number]): [number, number, number];
//# sourceMappingURL=label-offsets.d.ts.map