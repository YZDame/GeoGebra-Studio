export declare const currentWorkspace: () => string;
/** Keep the requested workspace scoped to one MCP call, including asynchronous exports. */
export declare function inWorkspace<T>(workspace: unknown, operation: () => Promise<T>): Promise<T>;
//# sourceMappingURL=workspace.d.ts.map