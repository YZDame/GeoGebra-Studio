export interface HtmlOptions {
    /** Defaults to 2D for existing constructions. */
    mode?: '2D' | '3D';
    /** Native 3D camera bounds and direction; omitted bounds fit visible points. */
    view3D?: {
        bounds?: [number, number, number, number, number, number];
        direction?: [number, number, number];
    };
    /** World-coordinate offsets for native LaTeX labels in 3D. */
    labelOffsets?: Record<string, [number, number, number]>;
    /** Kept for API compatibility; the viewer itself intentionally has no title. */
    title?: string;
    commands?: string[];
    ggbBase64?: string;
    /** Initial engine dimensions; the browser viewer resizes to its container. */
    width?: number;
    height?: number;
    /** Keep Cartesian axes visible in coordinate-based diagrams. */
    showAxes?: boolean;
    visibleLabels?: string[];
    captionOverrides?: Record<string, string>;
}
/** A responsive, title-free viewer for an embedded GGB or a semantic command construction. */
export declare function constructionHtml(options?: HtmlOptions): string;
//# sourceMappingURL=html.d.ts.map