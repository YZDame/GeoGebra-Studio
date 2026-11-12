// Real web-engine check: slider names and captions stay visible beside the control.
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');
const puppeteer = require('puppeteer-core');
const { resolveBrowser } = require('../dist/studio/browser');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'output/verification/sliders');

const ellipse = {
  filename: 'ellipse.html',
  showAxes: true,
  visibleLabels: ['F1', 'F2', 'P', 'A1', 'A2', 'B1', 'B2', 'c', 'a', 'info'],
  captionOverrides: { F1: 'F₁', F2: 'F₂', A1: 'A', A2: "A'", B1: 'B', B2: "B'" },
  commands: [
    'c=Slider(0.5,2.8,0.1,1,180,false,true,false,false)',
    'SetValue(c,2)',
    'SetCaption(c,"c 半焦距")',
    'SetCoords(c,70,40)',
    'ShowLabel(c,true)',
    'a=Slider(3,6,0.1,1,180,false,true,false,false)',
    'SetValue(a,4)',
    'SetCaption(a,"a 长半轴")',
    'SetCoords(a,70,90)',
    'ShowLabel(a,true)',
    'F1=(-c,0)',
    'F2=(c,0)',
    'SetColor(F1,"#B65C55")',
    'SetColor(F2,"#B65C55")',
    'SetPointSize(F1,5)',
    'SetPointSize(F2,5)',
    'ell=Ellipse(F1,F2,a)',
    'SetColor(ell,"#507A9D")',
    'SetLineThickness(ell,3)',
    'bb=sqrt(a^2-c^2)',
    'P=Point(ell)',
    'SetCoords(P,2,3)',
    'SetColor(P,"#A17A3D")',
    'SetPointSize(P,6)',
    's1=Segment(P,F1)',
    's2=Segment(P,F2)',
    'SetColor(s1,"#B65C55")',
    'SetColor(s2,"#C6A66D")',
    'SetLineThickness(s1,2)',
    'SetLineThickness(s2,2)',
    'A1=(a,0)',
    'A2=(-a,0)',
    'B1=(0,bb)',
    'B2=(0,-bb)',
    'SetColor(A1,"#507A9D")',
    'SetColor(A2,"#507A9D")',
    'SetColor(B1,"#507A9D")',
    'SetColor(B2,"#507A9D")',
    'sum=Distance(P,F1)+Distance(P,F2)',
    'info=Text("PF₁+PF₂="+sum+"，2a="+(2*a),(4.6,4.6),true)',
    'ZoomIn(-8,-6,9,6)',
  ],
};

// No ShowLabel and no visibleLabels entry. One name, one Chinese captionOverrides.
const parameters = {
  filename: 'parameters.html',
  showAxes: true,
  visibleLabels: ['P'],
  captionOverrides: { k: '圈数 k' },
  commands: [
    't=Slider(0,6.28,0.01,1,160,false,true,false,false)',
    'SetValue(t,2.4)',
    'SetCoords(t,90,36)',
    'k=Slider(1,8,1,1,160,false,true,false,false)',
    'SetValue(k,3)',
    'SetCoords(k,90,88)',
    'P=(t,k)',
    'ZoomIn(-1,-1,9,10)',
  ],
};

function generate(specPath, workspace) {
  const summary = execFileSync(process.execPath, [
    path.join(root, 'dist/cli.js'), 'generate',
    '--input', specPath,
    '--workspace', workspace,
  ], { encoding: 'utf8' });
  return JSON.parse(summary);
}

async function openConstruction(browser, file) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 800 });
  page.on('pageerror', error => console.error('PAGEERROR', error.message));
  await page.goto('about:blank');
  await page.setContent(await fs.readFile(file, 'utf8'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.ggbReady || window.ggbError, { timeout: 90000 });
  const state = await page.evaluate(() => ({
    error: window.ggbError,
    status: window.geogebraStudio && window.geogebraStudio.status,
    warnings: window.geogebraStudio && window.geogebraStudio.warnings,
  }));
  assert.equal(state.error, null, JSON.stringify(state));
  assert.equal(state.status, 'ready', JSON.stringify(state));
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 600));
  });
  return { page, warnings: state.warnings || [] };
}

async function labelState(page, name) {
  return page.evaluate(objectName => {
    const xml = ggbApplet.getXML(objectName);
    return {
      type: ggbApplet.getObjectType(objectName),
      slider: /<slider\b/.test(xml),
      visible: ggbApplet.getLabelVisible(objectName),
      style: ggbApplet.getLabelStyle(objectName),
      caption: ggbApplet.getCaption(objectName, false),
    };
  }, name);
}

(async () => {
  await fs.rm(output, { recursive: true, force: true });
  await fs.mkdir(output, { recursive: true });
  await fs.writeFile(path.join(output, 'ellipse.json'), JSON.stringify(ellipse, null, 2) + '\n');
  await fs.writeFile(path.join(output, 'parameters.json'), JSON.stringify(parameters, null, 2) + '\n');
  const ellipseFile = generate(path.join(output, 'ellipse.json'), output);
  const parametersFile = generate(path.join(output, 'parameters.json'), output);
  assert.equal(ellipseFile.success, true);
  assert.equal(parametersFile.success, true);

  const browser = await puppeteer.launch({ headless: true, executablePath: resolveBrowser() });
  try {
    const ellipsePage = await openConstruction(browser, ellipseFile.filename);
    assert(!ellipsePage.warnings.some(warning => /Slider label failed [ca]\b|Style failed [ca]:/.test(warning)),
      JSON.stringify(ellipsePage.warnings));
    for (const [name, caption] of [['c', 'c 半焦距'], ['a', 'a 长半轴']]) {
      const state = await labelState(ellipsePage.page, name);
      assert.equal(state.slider, true, name);
      assert.equal(state.visible, true, JSON.stringify(state));
      assert.equal(state.style, 3, JSON.stringify(state));
      assert.equal(state.caption, caption, JSON.stringify(state));
      assert.equal(await ellipsePage.page.evaluate(objectName => ggbApplet.exists('mcpLabel' + objectName), name), false);
    }
    for (const name of ['bb', 'sum']) {
      const state = await labelState(ellipsePage.page, name);
      assert.equal(state.slider, false, name);
      assert.equal(state.visible, false, JSON.stringify(state));
    }
    assert.equal(await ellipsePage.page.evaluate(() => ggbApplet.exists('mcpLabelP')), true);
    await ellipsePage.page.screenshot({ path: path.join(output, 'ellipse.png') });
    await ellipsePage.page.evaluate(() => ggbApplet.setValue('c', 1.2));
    await ellipsePage.page.evaluate(() => ggbApplet.setValue('a', 5));
    const afterValue = await labelState(ellipsePage.page, 'c');
    assert.equal(afterValue.visible, true);
    assert.equal(afterValue.style, 3);
    assert.equal(afterValue.caption, 'c 半焦距');
    assert.equal(await ellipsePage.page.evaluate(() => ggbApplet.getLabelVisible('a')), true);
    await ellipsePage.page.screenshot({ path: path.join(output, 'ellipse-after-drag.png') });

    const other = await openConstruction(browser, parametersFile.filename);
    const named = await labelState(other.page, 't');
    const captioned = await labelState(other.page, 'k');
    assert.equal(named.slider, true);
    assert.equal(named.visible, true, JSON.stringify(named));
    assert.equal(named.style, 0, JSON.stringify(named));
    assert.equal(captioned.slider, true);
    assert.equal(captioned.visible, true, JSON.stringify(captioned));
    assert.equal(captioned.style, 3, JSON.stringify(captioned));
    assert.equal(captioned.caption, '圈数 k', JSON.stringify(captioned));
    assert(!other.warnings.some(warning => /Slider label failed|Style failed [tk]:/.test(warning)),
      JSON.stringify(other.warnings));
    await other.page.screenshot({ path: path.join(output, 'parameters.png') });
    console.log(JSON.stringify({
      ellipse: { c: await labelState(ellipsePage.page, 'c'), a: await labelState(ellipsePage.page, 'a') },
      parameters: { t: named, k: captioned },
    }, null, 2));
    console.log('Slider names and Chinese captions stay visible in the web engine.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
