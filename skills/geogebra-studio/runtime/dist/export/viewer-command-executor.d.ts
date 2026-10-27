/** GeoGebra loads scripting, advanced geometry, CAS, etc. in separate chunks.
 * appletOnLoad only guarantees the core applet, not every command processor.
 */
export interface ViewerCommandApi {
    evalCommand(command: string): boolean;
    asyncEvalCommandGetLabels?: (command: string) => Promise<string | null>;
}
export declare function executeViewerCommand(api: ViewerCommandApi, command: string, timeoutMs?: number): Promise<boolean>;
//# sourceMappingURL=viewer-command-executor.d.ts.map