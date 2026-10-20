// Optional real-engine checks. Numerical samples detect regressions; they are not proofs.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const puppeteer = require('puppeteer-core');
const { validateViewerSpec } = require('../dist/studio/generate');
const { constructionHtml } = require('../dist/export/html');
const { resolveBrowser } = require('../dist/studio/browser');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'output/verification/math');
const tolerance = 1e-7;

async function check(page, name, expressions) {
  const results = await page.evaluate(expressions => expressions.map((expression, index) => {
    const label = 'studioRegression' + index;
    if (!ggbApplet.evalCommand(label + '=(' + expression + ')')) {
      throw Error('Cannot evaluate property: ' + expression);
    }
    return { expression, defined: ggbApplet.isDefined(label), value: ggbApplet.getValue(label) };
  }), expressions);
  for (const result of results) {
    assert(result.defined && Number.isFinite(result.value) && Math.abs(result.value) <= tolerance,
      name + ': ' + JSON.stringify(result));
  }
  return results;
}

(async () => {
  await fs.mkdir(output, { recursive: true });
  // Remove an old success report so a failed rerun cannot leave misleading evidence.
  await fs.rm(path.join(output, 'report.json'), { force: true });
  const browser = await puppeteer.launch({ headless: true, executablePath: resolveBrowser() });
  const report = { tolerance, samples: [], negativeControl: false };
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1000, height: 800 });
    for (const name of ['right-triangle', 'tangent-construction']) {
      const spec = validateViewerSpec(JSON.parse(await fs.readFile(path.join(root, 'examples', name + '.json'), 'utf8')));
      const html = constructionHtml(spec);
      await fs.writeFile(path.join(output, name + '.html'), html);
      await page.goto('about:blank');
      await page.setContent(html);
      await page.waitForFunction(() => ['ready', 'error'].includes(window.geogebraStudio?.status), { timeout: 90000 });
      const state = await page.evaluate(() => ({ status: geogebraStudio.status, checks: geogebraStudio.checks, error: window.ggbError }));
      assert.equal(state.status, 'ready', JSON.stringify(state));
      assert.deepEqual(state.checks.undefinedVisibleObjects, []);

      const expressions = name === 'right-triangle' ? [
        'Distance(A,B)^2+Distance(A,C)^2-Distance(B,C)^2',
        'Angle(B,A,C)-pi/2',
        'Distance(M,A)-Distance(M,B)',
        'Distance(M,C)-Distance(M,B)',
      ] : [
        'Distance(O,A)-5', 'Distance(O,B)-5', 'Distance(O,C)-5',
        'Distance(I,Line(A,B))-8/5', 'Distance(I,Line(A,C))-8/5',
      ];
      const count = name === 'right-triangle' ? 4 : 24;
      for (let index = 0; index < count; index++) {
        const inputs = await page.evaluate(({ name, index }) => {
          if (name === 'right-triangle') {
            const [b, h] = [[4,3], [3,4], [1.5,2], [8,6]][index];
            ggbApplet.setValue('b', b);
            ggbApplet.setValue('h', h);
            ggbApplet.setCoords('A', index / 2, -index / 3);
            return { expected: [b, h, index / 2, -index / 3], actual: [
              ggbApplet.getValue('b'), ggbApplet.getValue('h'),
              ggbApplet.getXcoord('A'), ggbApplet.getYcoord('A'),
            ] };
          } else {
            const angle = index * Math.PI / 12;
            ggbApplet.setCoords('A', 5 * Math.cos(angle), 5 * Math.sin(angle));
            return { expected: [5 * Math.cos(angle), 5 * Math.sin(angle)], actual: [
              ggbApplet.getXcoord('A'), ggbApplet.getYcoord('A'),
            ] };
          }
        }, { name, index });
        assert(inputs.actual.every((value, i) => Number.isFinite(value) && Math.abs(value - inputs.expected[i]) <= tolerance),
          'Sample inputs did not update: ' + JSON.stringify(inputs));
        if (name === 'tangent-construction') {
          const separations = await page.evaluate(() => [['A', 'B'], ['A', 'C'], ['B', 'C']].map(([a, b]) =>
            Math.hypot(ggbApplet.getXcoord(a) - ggbApplet.getXcoord(b),
              ggbApplet.getYcoord(a) - ggbApplet.getYcoord(b))));
          assert(separations.every(value => Number.isFinite(value) && value > 1e-4),
            'Tangent branches contain coincident points: ' + JSON.stringify(separations));
        }
        report.samples.push({ name, index, inputs, properties: await check(page, name + '[' + index + ']', expressions) });
      }
      // Restore the authored view before capturing a documentation preview.
      await page.goto('about:blank');
      await page.setContent(html);
      await page.waitForFunction(() => window.geogebraStudio?.status === 'ready', { timeout: 90000 });
      // Applet readiness precedes asynchronous LaTeX/canvas painting.
      await page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise(resolve => setTimeout(resolve, 1500));
      });
      await page.screenshot({ path: path.join(output, name + '.png') });
      console.log(name + ': ' + count + ' samples passed');
    }
    // A deliberately false mathematical property must fail the same checker.
    await assert.rejects(check(page, 'negative control', ['Distance(O,A)-6']), { code: 'ERR_ASSERTION' });
    report.negativeControl = true;
    await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
    console.log('Mathematical regression checks passed; false property rejected.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
