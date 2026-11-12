/**
 * Locate a file that ships beside the compiled `dist/` tree.
 *
 * The regular build resolves assets relative to `dist/export/`. Bundles that
 * copy the generated files elsewhere (the DeepSeek Harness plugin runtime)
 * replace this module at build time, so callers must not read the paths
 * themselves or cache them across installations.
 */
export declare function runtimeAsset(name: string): string;
/** Bundled Gikz license text; it travels with the viewer and the plugin. */
export declare function gikzLicensePath(): string;
//# sourceMappingURL=runtime-assets.d.ts.map