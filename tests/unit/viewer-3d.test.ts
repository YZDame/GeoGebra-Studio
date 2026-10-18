import { validateViewerSpec } from '../../src/studio/generate';
import { constructionHtml } from '../../src/export/html';

describe('3D viewer specifications', () => {
  const base = { filename: 'cube.html', commands: ['A=(0,0,0)'] };
  test('keeps existing 2D input compatible and emits explicit 3D options safely', () => {
    const payload = (options: any) => JSON.parse(constructionHtml(options).match(/<script id="construction-data" type="application\/json">([\s\S]*?)<\/script>/)![1]!);
    expect(payload(base).mode).toBe('2D');
    const spec = validateViewerSpec({ ...base, mode: '3D', view3D: { bounds: [-2,2,-2,2,-2,2], direction: [1,-2,1] }, labelOffsets: { A: [.1,.2,.3] }, captionOverrides: { A: '</script>' } });
    expect(payload(spec)).toMatchObject({ mode: '3D', view3D: spec.view3D, labelOffsets: spec.labelOffsets, captionOverrides: { A: '</script>' } });
  });
  test.each([
    { mode: '4D' }, { view3D: [] }, { view3D: { unknown: true } },
    { view3D: { bounds: [2,-2,-2,2,-2,2] } }, { view3D: { bounds: [-2,2,-2,2] } },
    { view3D: { direction: [0,0,0] } }, { view3D: { direction: [1,Infinity,1] } },
    { labelOffsets: { A: [1,2] } }, { labelOffsets: { A: [1,2,NaN] } },
  ])('rejects malformed camera or label options: %j', options => {
    expect(() => validateViewerSpec({ ...base, ...options })).toThrow();
  });
});
