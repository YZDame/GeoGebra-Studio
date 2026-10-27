interface GikzOptions {
    standalone?: boolean;
    points?: boolean;
    labels?: boolean;
    round?: boolean;
}
/** Source and GPL license travel with the viewer; no eval or external cleaner. */
export declare function gikzBrowserScripts(): string;
export declare function cleanWithGikz(source: string, options?: GikzOptions): Promise<string>;
export {};
//# sourceMappingURL=gikz.d.ts.map