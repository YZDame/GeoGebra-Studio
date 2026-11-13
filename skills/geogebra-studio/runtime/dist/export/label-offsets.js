"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLabelOffset = isLabelOffset;
exports.labelOffset2D = labelOffset2D;
exports.labelOffset3D = labelOffset3D;
function isLabelOffset(value) {
    return Array.isArray(value)
        && (value.length === 2 || value.length === 3)
        && value.every(component => typeof component === 'number' && Number.isFinite(component));
}
/** 2D labels: the authored (x, y) offset, else the viewer's default nudge. */
function labelOffset2D(offsets, name, dx, dy) {
    const custom = offsets?.[name];
    return custom ? [custom[0], custom[1]] : [dx, dy];
}
/** 3D labels: the authored vector, else the radial fallback from the centroid. */
function labelOffset3D(offsets, name, fallback) {
    const custom = offsets?.[name];
    if (!custom)
        return fallback;
    return [custom[0], custom[1], custom[2] ?? 0];
}
//# sourceMappingURL=label-offsets.js.map