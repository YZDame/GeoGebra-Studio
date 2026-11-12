"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runtimeAsset = runtimeAsset;
exports.gikzLicensePath = gikzLicensePath;
const path_1 = __importDefault(require("path"));
/**
 * Locate a file that ships beside the compiled `dist/` tree.
 *
 * The regular build resolves assets relative to `dist/export/`. Bundles that
 * copy the generated files elsewhere (the DeepSeek Harness plugin runtime)
 * replace this module at build time, so callers must not read the paths
 * themselves or cache them across installations.
 */
function runtimeAsset(name) {
    return path_1.default.join(__dirname, '../../dist', name);
}
/** Bundled Gikz license text; it travels with the viewer and the plugin. */
function gikzLicensePath() {
    return path_1.default.join(__dirname, '../../gikz/LICENSE');
}
//# sourceMappingURL=runtime-assets.js.map