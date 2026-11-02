/** Serve just one generated document, never the surrounding workspace. */
export declare function previewViewer(input: string, workspace: string): Promise<{
    server: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
    filename: string;
    url: string;
}>;
//# sourceMappingURL=preview.d.ts.map