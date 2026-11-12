import { readFileSync } from 'fs';
import {
  SLIDER_LABEL_CAPTION,
  SLIDER_LABEL_NAME,
  objectXmlIsSlider,
  planSliderLabel,
  showSliderLabels,
  SliderLabelApi,
} from '../../src/export/slider-labels';

const sliderXml = '<element type="numeric" label="a"><slider min="3" max="6" absoluteScreenLocation="true" width="180"/></element>';
const numberXml = '<element type="numeric" label="bb"><value val="3"/></element>';

describe('slider label plan', () => {
  test('detects a slider element and ignores other numerics', () => {
    expect(objectXmlIsSlider(sliderXml)).toBe(true);
    expect(objectXmlIsSlider(numberXml)).toBe(false);
    expect(objectXmlIsSlider('<element type="point"/>')).toBe(false);
  });

  test.each([
    ['a', '半长轴 a', undefined, { caption: '半长轴 a', style: SLIDER_LABEL_CAPTION }],
    ['c', 'c 半焦距', undefined, { caption: 'c 半焦距', style: SLIDER_LABEL_CAPTION }],
    ['a', '', undefined, { style: SLIDER_LABEL_NAME }],
    ['a', 'a', undefined, { style: SLIDER_LABEL_NAME }],
    ['a', '  ', undefined, { style: SLIDER_LABEL_NAME }],
    ['k', '', '圈数 k', { caption: '圈数 k', style: SLIDER_LABEL_CAPTION }],
    ['a', '半长轴 a', '长半轴 a', { caption: '长半轴 a', style: SLIDER_LABEL_CAPTION }],
    ['a', '半长轴 a', '', { style: SLIDER_LABEL_NAME }],
    ['a', '半长轴 a', '  a  ', { style: SLIDER_LABEL_NAME }],
  ])('plans %j / %j / %j', (name, caption, override, expected) => {
    expect(planSliderLabel(name as string, caption as string, override as string | undefined)).toEqual(expected);
  });
});

describe('showSliderLabels', () => {
  function apiFor(objects: Record<string, { type: string; xml: string; caption: string }>) {
    const calls: unknown[][] = [];
    const api = {
      getAllObjectNames: () => Object.keys(objects),
      getObjectType: (name: string) => objects[name]!.type,
      getXML: (name: string) => objects[name]!.xml,
      getCaption: (name: string) => objects[name]!.caption,
      setCaption: (name: string, caption: string) => calls.push(['caption', name, caption]),
      setLabelStyle: (name: string, style: number) => calls.push(['style', name, style]),
      setLabelVisible: (name: string, visible: boolean) => calls.push(['visible', name, visible]),
    } as SliderLabelApi;
    return { api, calls };
  }

  test('shows a Chinese caption and a bare name, and leaves other objects alone', () => {
    const { api, calls } = apiFor({
      a: { type: 'numeric', xml: sliderXml, caption: '' },
      c: { type: 'numeric', xml: sliderXml.replace('label="a"', 'label="c"'), caption: 'old' },
      bb: { type: 'numeric', xml: numberXml, caption: '' },
      P: { type: 'point', xml: '<element type="point" label="P"/>', caption: '' },
    });
    expect(showSliderLabels(api, { c: 'c 半焦距' })).toEqual([]);
    expect(calls).toEqual([
      ['style', 'a', SLIDER_LABEL_NAME],
      ['visible', 'a', true],
      ['caption', 'c', 'c 半焦距'],
      ['style', 'c', SLIDER_LABEL_CAPTION],
      ['visible', 'c', true],
    ]);
  });

  test('records a slider whose label API fails and still updates the next slider', () => {
    const { api, calls } = apiFor({
      a: { type: 'numeric', xml: sliderXml, caption: '半长轴 a' },
      b: { type: 'numeric', xml: sliderXml.replace('label="a"', 'label="b"'), caption: '' },
    });
    api.setLabelStyle = (name: string) => {
      if (name === 'a') throw new Error('style rejected');
      calls.push(['style', name, SLIDER_LABEL_NAME]);
    };
    expect(showSliderLabels(api)).toEqual(['a']);
    expect(calls.map(call => call[1])).toContain('b');
    expect(calls.filter(call => call[1] === 'a').some(call => call[0] === 'visible')).toBe(false);
  });
});

describe('viewer wiring', () => {
  const source = readFileSync('viewer/main.js', 'utf8');

  test('restores slider labels after the pass that hides native labels', () => {
    const hide = source.indexOf('api.setLabelVisible(name, false)');
    const restore = source.indexOf('showSliderLabels(api, captions)');
    expect(source.indexOf('objectXmlIsSlider')).toBeGreaterThan(-1);
    expect(source.indexOf('objectXmlIsSlider')).toBeLessThan(hide);
    expect(restore).toBeGreaterThan(hide);
  });
});
