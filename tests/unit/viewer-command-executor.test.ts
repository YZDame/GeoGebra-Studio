import { executeViewerCommand } from '../../src/export/viewer-command-executor';

describe('viewer command module loading', () => {
  test('waits for module loading and preserves command order', async () => {
    const unloaded = () => { throw new Error('Command not loaded yet. Please try asyncEvalCommand'); };
    let release!: (labels: string) => void;
    const api = { evalCommand: jest.fn(unloaded), asyncEvalCommandGetLabels: jest.fn()
      .mockImplementationOnce(() => new Promise<string>(resolve => { release = resolve; }))
      .mockResolvedValueOnce('B') };
    const run = (async () => {
      expect(await executeViewerCommand(api, 'A=Point(c)')).toBe(true);
      expect(await executeViewerCommand(api, 'B=Midpoint(A,O)')).toBe(true);
    })();
    expect(api.asyncEvalCommandGetLabels).toHaveBeenCalledTimes(1);
    release('A');
    await run;
    expect(api.evalCommand).toHaveBeenCalledTimes(2);
  });
  test.each(['A', 'A,B'])('accepts object labels %j after module loading', async labels => {
    expect(await executeViewerCommand({evalCommand: () => { throw new Error('Command not loaded'); }, asyncEvalCommandGetLabels: async () => labels}, 'A=Point(c)')).toBe(true);
  });
  test('keeps invalid commands as failures', async () => {
    expect(await executeViewerCommand({evalCommand: jest.fn().mockReturnValue(false), asyncEvalCommandGetLabels: async () => null}, 'InvalidCommand(1)')).toBe(false);
  });
  test('propagates engine failures without executing a command twice', async () => {
    const api = {evalCommand: jest.fn(() => { throw new Error('engine error'); }), asyncEvalCommandGetLabels: jest.fn()};
    await expect(executeViewerCommand(api, 'A=(0,0)')).rejects.toThrow('engine error');
    expect(api.evalCommand).toHaveBeenCalledTimes(1);
    expect(api.asyncEvalCommandGetLabels).not.toHaveBeenCalled();
  });
  test('bounds an unavailable command module', async () => {
    jest.useFakeTimers();
    const run = executeViewerCommand({evalCommand: () => { throw new Error('Command not loaded'); }, asyncEvalCommandGetLabels: () => new Promise(() => {})}, 'SetCoords(A,1,2)', 100);
    const assertion = expect(run).rejects.toThrow('timed out');
    jest.advanceTimersByTime(100);
    await assertion;
    expect(jest.getTimerCount()).toBe(0);
    jest.useRealTimers();
  });
  test('supports older applets without the async API', async () => {
    const api = {evalCommand: jest.fn().mockReturnValue(false)};
    expect(await executeViewerCommand(api, 'Invalid(1)')).toBe(false);
    expect(api.evalCommand).toHaveBeenCalledTimes(1);
  });
});
