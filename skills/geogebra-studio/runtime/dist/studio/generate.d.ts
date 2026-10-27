import { HtmlOptions } from '../export/html';
export interface ViewerSpec extends HtmlOptions {
    filename: string;
}
/** Validate without importing the MCP registry, Puppeteer, or GeoGebra runtime. */
export declare function validateViewerSpec(value: unknown): ViewerSpec;
/** Generation is file-only. Execution and geometry checks happen in the visible viewer. */
export declare function generateViewer(value: unknown, workspace: string): Promise<{
    success: boolean;
    filename: string | undefined;
    requiresNetwork: boolean;
    engineVerified: boolean;
    renderVerified: boolean;
    execution: string;
    note: string;
}>;
//# sourceMappingURL=generate.d.ts.map