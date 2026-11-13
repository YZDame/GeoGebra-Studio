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

export function isLabelOffset(value: unknown): value is LabelOffset {
  return Array.isArray(value)
    && (value.length === 2 || value.length === 3)
    && value.every(component => typeof component === 'number' && Number.isFinite(component));
}

/** 2D labels: the authored (x, y) offset, else the viewer's default nudge. */
export function labelOffset2D(
  offsets: Record<string, LabelOffset> | undefined,
  name: string,
  dx: number,
  dy: number,
): [number, number] {
  const custom = offsets?.[name];
  return custom ? [custom[0], custom[1]] : [dx, dy];
}

/** 3D labels: the authored vector, else the radial fallback from the centroid. */
export function labelOffset3D(
  offsets: Record<string, LabelOffset> | undefined,
  name: string,
  fallback: [number, number, number],
): [number, number, number] {
  const custom = offsets?.[name];
  if (!custom) return fallback;
  return [custom[0], custom[1], custom[2] ?? 0];
}
