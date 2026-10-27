export declare const browserCache: () => string;
export declare const managedBrowserPath: () => string;
export declare function browserCandidates(): string[];
/** Runtime lookup is cheap; installation/doctor additionally probes launch compatibility. */
export declare function resolveBrowser(): string;
export declare function prepareBrowser(download?: boolean): Promise<string>;
//# sourceMappingURL=browser.d.ts.map