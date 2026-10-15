import { executeViewerStyleCommand, executeViewerViewportCommand, ViewerStyleApi } from '../../src/export/viewer-style-commands';

describe('viewer explicit viewport commands', () => {
  test.each(['ZoomIn(-11,-6.5,11,6.5)', 'ZoomIn[ -11, -6.5, 11, 6.5 ]'])('maps coordinate order for %s', command => {
    const api = { setCoordSystem: jest.fn() };
    expect(executeViewerViewportCommand(api, command)).toBe(true);
    expect(api.setCoordSystem).toHaveBeenCalledWith(-11, 11, -6.5, 6.5);
  });
  test.each(['ZoomIn(2)', 'ZoomIn(A,B)', 'ZoomIn(xmin,-6,11,6)', 'Line(A,B)'])('leaves other forms with the parser: %s', command => {
    const api = { setCoordSystem: jest.fn() };
    expect(executeViewerViewportCommand(api, command)).toBeNull();
    expect(api.setCoordSystem).not.toHaveBeenCalled();
  });
  test.each(['ZoomIn(11,-6,-11,6)', 'ZoomIn(-11,6,11,-6)', 'ZoomIn(0,0,0,1)', 'ZoomIn(-1e999,-6,11,6)'])('rejects invalid bounds: %s', command => {
    const api = { setCoordSystem: jest.fn() };
    expect(() => executeViewerViewportCommand(api, command)).toThrow('finite');
    expect(api.setCoordSystem).not.toHaveBeenCalled();
  });
});

describe('viewer literal style commands', () => {
  let api: jest.Mocked<ViewerStyleApi>;
  beforeEach(() => {
    api = {
      exists: jest.fn().mockReturnValue(true), setColor: jest.fn(),
      setLineThickness: jest.fn(), setLineStyle: jest.fn(), setPointSize: jest.fn(),
    };
  });

  test.each([
    ['SetColor(a,170,178,188)', [170, 178, 188]],
    ['SetColor(a,"#AAB2BC")', [170, 178, 188]],
    ['SetColor(a,0,0.5,1)', [0, 128, 255]],
    ['SetColor[a, 1, 0, 0]', [255, 0, 0]],
    ['SetColor(a,"red")', [255, 0, 0]],
  ])('handles %s without the localized command parser', (command, rgb) => {
    expect(executeViewerStyleCommand(api, command)).toBe(true);
    expect(api.setColor).toHaveBeenCalledWith('a', ...rgb);
  });

  test('applies styles to dependent objects with subscript labels', () => {
    executeViewerStyleCommand(api, 'SetLineThickness(s_1,5)');
    executeViewerStyleCommand(api, 'SetLineStyle(s_1,2)');
    executeViewerStyleCommand(api, 'SetPointSize(A_1,5)');
    expect(api.setLineThickness).toHaveBeenCalledWith('s_1', 5);
    expect(api.setLineStyle).toHaveBeenCalledWith('s_1', 2);
    expect(api.setPointSize).toHaveBeenCalledWith('A_1', 5);
  });

  test.each(['A=(0,0)', 'Line(A,B)', 'SetColor(a,"unknowncolor")', 'SetColor(a,t,0,1)', 'SetPointSize(A,2+1)'])('preserves parser behavior for %s', command => {
    expect(executeViewerStyleCommand(api, command)).toBeNull();
    expect(api.exists).not.toHaveBeenCalled();
    expect(api.setColor).not.toHaveBeenCalled();
  });

  test.each(['SetColor(a,256,0,0)', 'SetColor(a,-1,0,0)', 'SetColor(a,1e999,0,0)', 'SetLineStyle(a,5)', 'SetPointSize(A,0)', 'SetLineThickness(a,1.5)'])('reports invalid style values: %s', command => {
    expect(() => executeViewerStyleCommand(api, command)).toThrow();
    expect(api.setColor).not.toHaveBeenCalled();
  });

  test('does not silently ignore missing objects or applet API failures', () => {
    api.exists.mockReturnValue(false);
    expect(() => executeViewerStyleCommand(api, 'SetColor(missing,"#AAB2BC")')).toThrow('Style target does not exist');
    api.exists.mockReturnValue(true);
    api.setColor.mockImplementation(() => { throw new Error('engine failed'); });
    expect(() => executeViewerStyleCommand(api, 'SetColor(a,"#AAB2BC")')).toThrow('engine failed');
  });
});
