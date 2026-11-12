/** Scripting commands often return no objects, so evalCommand's false result
 * cannot tell successful actions from errors. Use explicit native setters.
 */
export interface ViewerActionApi {
    exists(name: string): boolean;
    getValue(expression: string): number;
    setCoords(name: string, ...coordinates: number[]): void;
    setVisible(name: string, visible: boolean): void;
    setFixed(name: string, fixed: boolean, selectionAllowed?: boolean): void;
    setLabelVisible(name: string, visible: boolean): void;
    setLabelStyle(name: string, style: number): void;
    setCaption(name: string, caption: string): void;
    setFilling(name: string, filling: number): void;
    setLayer(name: string, layer: number): void;
    setPointStyle(name: string, style: number): void;
    setValue(name: string, value: number): void;
    setTextValue(name: string, value: string): void;
    setTrace(name: string, trace: boolean): void;
    setAuxiliary(name: string, auxiliary: boolean): void;
    setAnimating(name: string, animating: boolean): void;
    setAnimationSpeed(name: string, speed: number): void;
}
/** Split arguments without breaking strings, nested expressions or lists. */
export declare function splitCommandArguments(input: string): string[];
/** getValue returns 0 for malformed/unknown expressions, so check definition first. */
export declare function evaluateViewerNumber(api: {
    getValue?(expression: string): number;
}, expression: string): number;
export declare function executeViewerActionCommand(api: ViewerActionApi, command: string): true | null;
//# sourceMappingURL=viewer-action-commands.d.ts.map