import {
  isLabelOffset,
  labelOffset2D,
  labelOffset3D,
} from '../../src/export/label-offsets';

describe('label offsets', () => {
  test.each([
    [[0, -0.4], true],
    [[0, -0.4, 0], true],
    [[0], false],
    [[0, 1, 2, 3], false],
    [['0', 1], false],
    [[0, Number.NaN], false],
    [null, false],
    ['0,-0.4', false],
  ])('validates %j', (value, expected) => {
    expect(isLabelOffset(value)).toBe(expected);
  });

  test('2D keeps the default nudge unless the object authors an offset', () => {
    expect(labelOffset2D(undefined, 'F_2', 0.116, 0.114)).toEqual([0.116, 0.114]);
    expect(labelOffset2D({ F_2: [0.05, -0.4] }, 'F_2', 0.116, 0.114)).toEqual([0.05, -0.4]);
    expect(labelOffset2D({ F_2: [0.05, -0.4, 2] }, 'F_2', 0.116, 0.114)).toEqual([0.05, -0.4]);
    expect(labelOffset2D({ F_2: [0.05, -0.4] }, 'F_1', 0.116, 0.114)).toEqual([0.116, 0.114]);
  });

  test('3D reads all three components and pads a 2D author entry', () => {
    expect(labelOffset3D(undefined, 'P', [1, 0, 0])).toEqual([1, 0, 0]);
    expect(labelOffset3D({ P: [1, 2, 3] }, 'P', [0, 0, 0])).toEqual([1, 2, 3]);
    expect(labelOffset3D({ P: [1, 2] }, 'P', [0, 0, 0])).toEqual([1, 2, 0]);
  });
});
