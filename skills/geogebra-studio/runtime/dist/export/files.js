"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveText = void 0;
exports.saveFile = saveFile;
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const workspace_1 = require("./workspace");
/** Restrict new export destinations, including existing ancestor symlinks, to workspace. */
async function saveFile(filename, content) {
    if (filename === undefined)
        return undefined;
    if (typeof filename !== 'string' || !filename.trim())
        throw new Error('filename must be a nonempty string');
    const root = await (0, promises_1.realpath)((0, workspace_1.currentWorkspace)());
    const target = path_1.default.resolve(root, filename);
    const inside = (s) => s.startsWith(root + path_1.default.sep);
    if (!inside(target))
        throw new Error('Export path is outside workspace');
    // Validate every existing component before creating directories.
    let current = root;
    for (const part of path_1.default.relative(root, target).split(path_1.default.sep)) {
        current = path_1.default.join(current, part);
        try {
            const stat = await (0, promises_1.lstat)(current);
            if (stat.isSymbolicLink())
                throw new Error('Export paths may not contain symbolic links');
        }
        catch (e) {
            if (e.code !== 'ENOENT')
                throw e;
        }
    }
    await (0, promises_1.mkdir)(path_1.default.dirname(target), { recursive: true });
    if (!inside(await (0, promises_1.realpath)(path_1.default.dirname(target))) && path_1.default.dirname(target) !== root)
        throw new Error('Export parent is outside workspace');
    await (0, promises_1.writeFile)(target, content, { flag: 'wx' });
    return target;
}
const saveText = (filename, content) => saveFile(filename, content);
exports.saveText = saveText;
//# sourceMappingURL=files.js.map