"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeViewerCommand = executeViewerCommand;
async function executeViewerCommand(api, command, timeoutMs = 30000) {
    // Action commands must be dispatched through native setters before this
    // function: GeoGebra returns null for both actions and invalid commands.
    // The asynchronous parser handles module loading for object-producing commands.
    try {
        return api.evalCommand(command);
    }
    catch (error) {
        // Never retry a false result: actions may already have run. Retry only the
        // engine's explicit unloaded-module exception, before command execution.
        const message = error instanceof Error ? error.message : String(error);
        if (!/command.*not.*loaded|CommandNotLoadedError|asyncEvalCommand/i.test(message)
            || typeof api.asyncEvalCommandGetLabels !== 'function')
            throw error;
    }
    let timer;
    try {
        const result = await Promise.race([
            api.asyncEvalCommandGetLabels(command),
            new Promise((_, reject) => {
                timer = setTimeout(() => reject(new Error('GeoGebra command module loading/execution timed out; check the network and reload')), timeoutMs);
            }),
        ]);
        return typeof result === 'string';
    }
    finally {
        if (timer !== undefined)
            clearTimeout(timer);
    }
}
//# sourceMappingURL=viewer-command-executor.js.map