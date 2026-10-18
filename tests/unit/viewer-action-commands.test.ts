import { executeViewerActionCommand, splitCommandArguments, ViewerActionApi } from '../../src/export/viewer-action-commands';

describe('native scripting actions', () => {
  let api: jest.Mocked<ViewerActionApi>;
  beforeEach(() => {
    api = Object.fromEntries(['exists','getValue','setCoords','setVisible','setFixed','setLabelVisible','setLabelStyle','setCaption','setFilling','setLayer','setPointStyle','setValue','setTextValue','setTrace','setAuxiliary','setAnimating','setAnimationSpeed'].map(name => [name,jest.fn()])) as unknown as jest.Mocked<ViewerActionApi>;
    api.exists.mockReturnValue(true); api.getValue.mockReturnValue(NaN);
  });
  test('executes the reported SetCoords case exactly once', () => {
    expect(executeViewerActionCommand(api,'SetCoords(A, 3.715724127387, -2.208131000984)')).toBe(true);
    expect(api.setCoords).toHaveBeenCalledWith('A',3.715724127387,-2.208131000984);
    expect(api.setCoords).toHaveBeenCalledTimes(1);
  });
  test('supports bracket syntax, 3D and expressions', () => {
    api.getValue.mockImplementation(expression => expression.startsWith('IsDefined(') ? 1 : 2);
    executeViewerActionCommand(api,'SetCoords[A_1, x(B), 1+1, 3]');
    expect(api.setCoords).toHaveBeenCalledWith('A_1',2,2,3);
  });
  test('handles nested arguments and quoted commas', () => {
    expect(splitCommandArguments('A, If(t>0,1,2), "a,b"')).toEqual(['A','If(t>0,1,2)','"a,b"']);
    executeViewerActionCommand(api,'SetCaption(A,"a,b")');
    expect(api.setCaption).toHaveBeenCalledWith('A','a,b');
  });
  test('handles visibility and selection without relying on parser return values', () => {
    executeViewerActionCommand(api,'SetVisibleInView(A,1,false)');
    executeViewerActionCommand(api,'SetFixed(A,true,false)');
    expect(api.setVisible).toHaveBeenCalledWith('A',false);
    expect(api.setFixed).toHaveBeenCalledWith('A',true,false);
  });
  test('hides construction helpers in the native 3D view', () => {
    expect(executeViewerActionCommand(api,'SetVisibleInView(A,-1,false)')).toBe(true);
    expect(api.setVisible).toHaveBeenCalledWith('A',false);
  });
  test.each(['SetCoords(A,1)','SetCoords(A,1,1e999)','SetCoords(A,unknown,1)','SetFixed(A,3)','SetVisibleInView(A,2,true)','SetFilling(A,2)','SetLayer(A,1.5)','SetCaption(A,missing)'])('rejects invalid actions: %s', command => {
    expect(() => executeViewerActionCommand(api,command)).toThrow();
    expect(api.setCoords).not.toHaveBeenCalled();
  });
  test('rejects unknown expressions even when getValue would return zero', () => {
    api.getValue.mockReturnValue(0);
    expect(() => executeViewerActionCommand(api,'SetCoords(A,unknown,2)')).toThrow('defined numeric');
    expect(api.setCoords).not.toHaveBeenCalled();
  });
  test('rejects a nonexistent target', () => {
    api.exists.mockReturnValue(false);
    expect(() => executeViewerActionCommand(api,'SetCoords(A,1,2)')).toThrow('does not exist');
  });
  test('leaves geometry with the command parser', () => {
    expect(executeViewerActionCommand(api,'A=Midpoint(B,C)')).toBeNull();
    expect(api.exists).not.toHaveBeenCalled();
  });
});
