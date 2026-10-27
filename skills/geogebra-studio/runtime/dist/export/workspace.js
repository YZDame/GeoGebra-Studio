"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentWorkspace = void 0;
exports.inWorkspace = inWorkspace;
const async_hooks_1 = require("async_hooks");
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const context = new async_hooks_1.AsyncLocalStorage();
const currentWorkspace = () => context.getStore() || process.env['VSCODE_WORKSPACE_FOLDER'] || process.cwd();
exports.currentWorkspace = currentWorkspace;
/** Keep the requested workspace scoped to one MCP call, including asynchronous exports. */
async function inWorkspace(workspace, operation) {
    if (workspace === undefined)
        return operation();
    if (typeof workspace !== 'string' || !path_1.default.isAbsolute(workspace))
        throw new Error('workspace must be an absolute directory path');
    const root = await (0, promises_1.realpath)(workspace);
    if (!(await (0, promises_1.stat)(root)).isDirectory())
        throw new Error('workspace must be a directory');
    return context.run(root, operation);
}
//# sourceMappingURL=workspace.js.map