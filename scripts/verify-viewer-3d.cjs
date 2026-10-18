// Native-app regression for the generated 3D viewer; no HTML post-processing.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const puppeteer = require('puppeteer-core').default;
const { constructionHtml } = require('../dist/export/html');
const { resolveBrowser } = require('../dist/studio/browser');
const { viewerThemes } = require('../dist/export/viewer-themes');
const fixture = require('../examples/cube-3d.json');
const ready = async page => {
  await page.waitForFunction('window.ggbReady || window.ggbError', { timeout: 60000 });
  assert.equal(await page.evaluate(() => window.ggbError), null);
};
const readState = page => page.evaluate(() => {
  const api = window.ggbApplet;
  const xml = new DOMParser().parseFromString(api.getXML(), 'application/xml');
  const view = xml.querySelector('euclidianView3D');
  const bg = view.querySelector('bgColor');
  return {
    paper: getComputedStyle(document.documentElement).getPropertyValue('--paper').trim().toLowerCase(),
    background: '#' + ['r','g','b'].map(k => Number(bg.getAttribute(k)).toString(16).padStart(2,'0')).join(''),
    camera: view.querySelector('coordSystem').outerHTML,
    checks: window.geogebraStudio.checks, warnings: window.geogebraStudio.warnings,
    labels: [...xml.querySelectorAll('element[type="text"]')].map(el => ({
      name: el.getAttribute('label'), latex: el.querySelector('isLaTeX')?.getAttribute('val'),
      z: el.querySelector('startPoint')?.getAttribute('z'),
    })),
    pointSize: xml.querySelector('element[label="A"] pointSize')?.getAttribute('val'),
    edgeWeight: xml.querySelector('element[label="e1"] lineStyle')?.getAttribute('thickness'),
    diagonalWeight: xml.querySelector('element[label="diagonal"] lineStyle')?.getAttribute('thickness'),
    alpha: api.getValue('alpha'),
  };
});
const chooseTheme = async (page, name, dark) => {
  await page.click('#theme-toggle'); await page.click(`[data-theme="${name}"]`);
  const current = await page.$eval('#mode-toggle', b => b.getAttribute('aria-pressed') === 'true');
  if (current !== dark) await page.click('#mode-toggle');
  await page.waitForFunction(() => {
    const xml = new DOMParser().parseFromString(ggbApplet.getXML(), 'application/xml');
    const bg = xml.querySelector('euclidianView3D bgColor');
    const hex = '#' + ['r','g','b'].map(k => Number(bg.getAttribute(k)).toString(16).padStart(2,'0')).join('');
    return hex === getComputedStyle(document.documentElement).getPropertyValue('--paper').trim().toLowerCase();
  }, { timeout: 5000 });
};
(async () => {
  const dir = path.resolve('outputs/verification/3d'); await fs.mkdir(dir, { recursive: true });
  const browser = await puppeteer.launch({ headless: true, executablePath: resolveBrowser() });
  try {
    const page = await browser.newPage(); await page.setViewport({ width: 1100, height: 850 });
    const html = constructionHtml(fixture); await fs.writeFile(path.join(dir, 'cube.html'), html);
    await page.setContent(html); await ready(page);
    let state = await readState(page);
    assert.deepEqual(state.warnings, []);
    assert.equal(state.labels.length, 8); assert(state.labels.every(l => l.latex === 'true' && l.z !== null));
    assert.equal(state.pointSize, '1'); assert.equal(state.edgeWeight, '1'); assert.equal(state.diagonalWeight, '2');
    assert(state.checks.equalAxes && state.checks.viewWidth > 0 && state.checks.viewHeight > 0);
    assert(Math.abs(state.alpha * 180 / Math.PI - 35.26438968) < 1e-6);
    assert.equal(await page.$('.lesson-note'), null);
    for (const name of Object.keys(viewerThemes)) for (const dark of [false,true]) {
      await chooseTheme(page, name, dark); state = await readState(page);
      assert.equal(state.paper, viewerThemes[name][Number(dark)].paper.toLowerCase());
      assert.equal(state.background, state.paper);
    }
    await chooseTheme(page, 'default', false); await page.screenshot({ path: path.join(dir, 'light.png') });
    await chooseTheme(page, 'default', true); await page.screenshot({ path: path.join(dir, 'dark.png') });
    // Native rotation must survive sidebar transitions and responsive resizing.
    const beforeRotate = (await readState(page)).camera;
    await page.mouse.move(850,400); await page.mouse.down(); await page.mouse.move(960,450,{steps:12}); await page.mouse.up();
    await page.waitForFunction(old => {
      const xml = new DOMParser().parseFromString(ggbApplet.getXML(), 'application/xml');
      return xml.querySelector('euclidianView3D coordSystem').outerHTML !== old;
    }, { timeout: 5000 }, beforeRotate);
    // GeoGebra gives a released rotation drag inertia; stop it before comparing cameras.
    await page.mouse.click(1000,600);
    await page.waitForFunction(async () => {
      const camera = () => new DOMParser().parseFromString(ggbApplet.getXML(), 'application/xml').querySelector('euclidianView3D coordSystem').outerHTML;
      const before = camera(); await new Promise(r => setTimeout(r,200)); return camera() === before;
    }, {timeout:10000});
    const rotated = (await readState(page)).camera;
    await page.click('#sidebar-toggle'); await page.waitForSelector('.algebraView');
    assert.equal(await page.$eval('#sidebar-toggle', b => b.getAttribute('aria-expanded')), 'true');
    assert.equal((await readState(page)).camera, rotated);
    await page.click('#sidebar-toggle');
    for (const viewport of [{width:480,height:800},{width:1400,height:900},{width:1100,height:850}]) {
      await page.setViewport(viewport);
      await page.waitForFunction(() => {
        const host = document.getElementById('ggb-element').getBoundingClientRect();
        return [...document.querySelectorAll('#ggb-element canvas')].some(c => {
          const r = c.getBoundingClientRect(); return Math.abs(r.width-host.width)<5 && Math.abs(r.height-host.height)<60;
        });
      }, { timeout: 10000 });
      assert.equal((await readState(page)).camera, rotated);
    }
    await page.evaluate(() => ggbApplet.setCoords('A', -1.2,-1,-1));
    const client = await page.createCDPSession(); await client.send('Browser.setDownloadBehavior', {behavior:'allow',downloadPath:dir});
    const file = path.join(dir,'construction.html'); await fs.rm(file,{force:true});
    await page.click('#download-toggle'); await page.click('[data-format="html"]');
    let saved;
    for(let i=0;i<100;i++){try{saved=await fs.readFile(file,'utf8');if(saved.length>1000)break;}catch{}await new Promise(r=>setTimeout(r,100));}
    assert(saved, 'Current HTML download missing');
    const payload = JSON.parse(saved.match(/<script id="construction-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(payload.mode,'3D'); assert.equal(payload.commands.length,0);
    const reopened = await browser.newPage(); await reopened.setViewport({width:1100,height:850});
    await reopened.setContent(saved); await ready(reopened); state = await readState(reopened);
    assert.equal(await reopened.evaluate(() => ggbApplet.getXcoord('A')), -1.2);
    assert.equal(state.background,state.paper); assert.equal(state.labels.length,8); assert.equal(state.camera,rotated);
    // Existing 2D construction, equal scaling, labels and theme changes remain usable.
    const plane = await browser.newPage(); await plane.setContent(constructionHtml({commands:['A=(0,0)','B=(3,0)','c=Circle(A,B)']})); await ready(plane);
    assert.equal(await plane.evaluate(() => geogebraStudio.checks.equalAxes),true);
    assert((await plane.evaluate(() => ggbApplet.getXML('mcpLabelA'))).includes('<isLaTeX val="true"/>'));
    await plane.click('#mode-toggle');
    assert.equal(await plane.evaluate(() => {
      const o=ggbApplet.getGraphicsOptions(1),opts=typeof o==='string'?JSON.parse(o):o;
      return opts.bgColor.toLowerCase()===getComputedStyle(document.documentElement).getPropertyValue('--paper').trim().toLowerCase();
    }),true);
    console.log(JSON.stringify({native3D:true,latexLabels:8,thinDefaults:true,themePairs:9,backgroundMatches:true,rotation:true,sidebar:true,resizing:true,packedHTML:true,legacy2D:true}));
  } finally { await browser.close(); }
})().catch(e => {console.error(e);process.exitCode=1;});
