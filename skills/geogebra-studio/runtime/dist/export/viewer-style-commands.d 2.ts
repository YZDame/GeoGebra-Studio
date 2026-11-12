/** Execute literal styling commands through the language-independent applet API.
 * Return null for commands/expressions that must remain with GeoGebra's parser.
 */
export interface ViewerStyleApi {
    exists(name: string): boolean;
    getValue?(expression: string): number;
    setColor(name: string, red: number, green: number, blue: number): void;
    setLineThickness(name: string, value: number): void;
    setLineStyle(name: string, value: number): void;
    setPointSize(name: string, value: number): void;
}
export interface ViewerViewportApi {
    getValue?(expression: string): number;
    setCoordSystem(xmin: number, xmax: number, ymin: number, ymax: number): void;
}
/** ZoomIn's argument order differs from setCoordSystem's. */
export declare function executeViewerViewportCommand(api: ViewerViewportApi, command: string): true | null;
export declare function executeViewerStyleCommand(api: ViewerStyleApi, command: string): true | null;
//# sourceMappingURL=viewer-style-commands.d.ts.map