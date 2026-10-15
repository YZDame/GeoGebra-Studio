/** GeoGebra loads scripting, advanced geometry, CAS, etc. in separate chunks.
 * appletOnLoad only guarantees the core applet, not every command processor.
 */
export interface ViewerCommandApi {
  evalCommand(command: string): boolean;
  asyncEvalCommandGetLabels?: (command: string) => Promise<string | null>;
}

export async function executeViewerCommand(
  api: ViewerCommandApi, command: string, timeoutMs = 30000,
): Promise<boolean> {
  // Action commands must be dispatched through native setters before this
  // function: GeoGebra returns null for both actions and invalid commands.
  // The asynchronous parser handles module loading for object-producing commands.
  try {
    return api.evalCommand(command);
  } catch (error) {
    // Never retry a false result: actions may already have run. Retry only the
    // engine's explicit unloaded-module exception, before command execution.
    const message = error instanceof Error ? error.message : String(error);
    if (!/command.*not.*loaded|CommandNotLoadedError|asyncEvalCommand/i.test(message)
      || typeof api.asyncEvalCommandGetLabels !== 'function') throw error;
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      api.asyncEvalCommandGetLabels(command),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('GeoGebra command module loading/execution timed out; check the network and reload')), timeoutMs);
      }),
    ]);
    return typeof result === 'string';
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
