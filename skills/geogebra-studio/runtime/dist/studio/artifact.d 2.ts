import { HtmlOptions } from '../export/html';
/** Isolated native execution → packed GGB → reopen final viewer → save, never a shared pool reset. */
export declare function buildArtifact(options: HtmlOptions & {
    filename: string;
}): Promise<{
    content: ({
        type: "text";
        text: string;
        mimeType?: never;
        data?: never;
    } | {
        type: "image";
        mimeType: string;
        data: string;
        text?: never;
    })[];
    structuredContent: {
        success: boolean;
        format: string;
        filename: string;
        previewFilename: string | undefined;
        html: string;
        constructionXml: string;
        engineVerified: boolean;
        packedGgbVerified: boolean;
        layoutChecks: {
            loaded: boolean;
            equalAxes: true;
            viewWidth: number;
            viewHeight: number;
        };
        renderVerified: boolean;
        requiresNetwork: boolean;
        objectCount: number;
        note: string;
    };
}>;
//# sourceMappingURL=artifact.d.ts.map