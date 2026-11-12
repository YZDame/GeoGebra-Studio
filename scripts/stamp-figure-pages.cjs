'use strict';

/**
 * The viewer generator keeps a generic <title>GeoGebra</title>.
 * Pages publishes examples/*.html at /figures/, so this script stamps
 * a specific title, description, and canonical onto those copies only.
 * It does not edit examples/ or the viewer markup after <style>.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ORIGIN = 'https://yzdame.github.io/GeoGebra-Studio';
const UNOFFICIAL_EN = 'Interactive figure from GeoGebra Studio, an unofficial project not affiliated with GeoGebra.';
const UNOFFICIAL_ZH = 'GeoGebra Studio 的交互示例，非官方项目，与 GeoGebra 无隶属关系。';

const FIGURES = [
  {
    file: 'napoleon.html',
    lang: 'en',
    title: "Napoleon's theorem",
    description: `Drag a vertex and watch the triangle of centers remain equilateral. ${UNOFFICIAL_EN}`
  },
  {
    file: 'nine-point-circle.html',
    lang: 'en',
    title: 'Nine-point circle and Euler line',
    description: `Drag a vertex and follow the nine points and the Euler line. ${UNOFFICIAL_EN}`
  },
  {
    file: 'cycloid.html',
    lang: 'en',
    title: 'Cycloid',
    description: `Move the slider to roll a circle along the x-axis and trace a point on its rim. ${UNOFFICIAL_EN}`
  },
  {
    file: 'spirograph.html',
    lang: 'en',
    title: 'Spirograph',
    description: `Change the rolling circle's radius and the pen's distance from its center. ${UNOFFICIAL_EN}`
  },
  {
    file: 'fourier-square-wave.html',
    lang: 'en',
    title: 'Fourier approximation of a square wave',
    description: `Change the number of odd harmonics and compare the partial sum with the square wave. ${UNOFFICIAL_EN}`
  },
  {
    file: 'pascal-theorem.html',
    lang: 'en',
    title: "Pascal's theorem",
    description: `Drag six points on an ellipse and watch the intersections of the opposite sides stay collinear. ${UNOFFICIAL_EN}`
  },
  {
    file: 'mandelbrot.html',
    lang: 'en',
    title: 'Mandelbrot set',
    description: `Drag the red parameter point to change the first twelve iterates of z mapped to z squared plus c. ${UNOFFICIAL_EN}`
  },
  {
    file: 'golden-spiral-sunflower.html',
    lang: 'en',
    title: 'Golden spiral and sunflower',
    description: `Compare quarter-turn growth by the golden ratio with seeds placed at the golden angle. ${UNOFFICIAL_EN}`
  },
  {
    file: 'hyperboloid-ruled.html',
    lang: 'en',
    title: 'Ruled hyperboloid',
    description: `Rotate the surface to see both families of straight lines. ${UNOFFICIAL_EN}`
  },
  {
    file: 'mobius-strip.html',
    lang: 'en',
    title: 'Möbius strip',
    description: `Follow the single boundary through one half twist of the strip. ${UNOFFICIAL_EN}`
  },
  {
    file: 'klein-bottle.html',
    lang: 'en',
    title: 'Klein bottle',
    description: `Rotate the figure-eight immersion and find where it crosses itself. ${UNOFFICIAL_EN}`
  },
  {
    file: 'torus-knot.html',
    lang: 'en',
    title: 'T(p,q) torus knot',
    description: `The default (2, 3) curve is a trefoil. Change p and q from the object sidebar. ${UNOFFICIAL_EN}`
  },
  {
    file: 'helicoid.html',
    lang: 'en',
    title: 'Helicoid minimal surface',
    description: `Rotate the minimal surface traced by a straight line that turns while rising along the z-axis. ${UNOFFICIAL_EN}`
  },
  {
    file: 'lorenz-attractor.html',
    lang: 'en',
    title: 'Lorenz attractor',
    description: `Rotate the numerically integrated trajectory for sigma = 10, rho = 28 and beta = 8/3. ${UNOFFICIAL_EN}`
  },
  {
    file: 'circle-tangency.html',
    lang: 'zh-CN',
    title: '两圆的极线与切线',
    description: `点 A 在圆 Γ 上，向内部的圆 ω 作两条切线，并画出 A 关于 ω 的极线。${UNOFFICIAL_ZH}`
  },
  {
    file: 'cube-3d.html',
    lang: 'zh-CN',
    title: '正方体中的线面角',
    description: `正方体的体对角线与底面所成的角，可以旋转查看。${UNOFFICIAL_ZH}`
  },
  {
    file: 'triangle.html',
    lang: 'zh-CN',
    title: '三角形、中线与外接圆',
    description: `三角形 ABC、从 C 到 AB 中点的中线，以及外接圆。${UNOFFICIAL_ZH}`
  }
];

const HOME_TITLE = 'GeoGebra Studio：用 Agent Skill 把题目做成可拖动图形';
const HOME_DESCRIPTION = '非官方 Agent Skill。把一道题目交给它，生成可拖动、可导出的 GeoGebra 图形，格式包括 GGB、PNG、PDF、TikZ 和 HTML。与 GeoGebra 官方无隶属关系。';

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function expectedSitemap() {
  const urls = [`${ORIGIN}/`, ...FIGURES.map((figure) => `${ORIGIN}/figures/${figure.file}`)];
  const entries = urls.map((url) => `  <url>\n    <loc>${url}</loc>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

function assertSitemap(file) {
  const actual = fs.readFileSync(file, 'utf8');
  const expected = expectedSitemap();
  if (actual !== expected) {
    throw new Error(`sitemap does not match the figure catalog: ${file}`);
  }
}

function assertExamplesCovered() {
  const files = fs.readdirSync(path.join(ROOT, 'examples')).filter((name) => name.endsWith('.html')).sort();
  const listed = FIGURES.map((figure) => figure.file);
  const unique = new Set(listed);
  if (unique.size !== listed.length) throw new Error('duplicate figure catalog entries');
  const extra = files.filter((name) => !unique.has(name));
  const missing = listed.filter((name) => !files.includes(name));
  if (extra.length || missing.length) {
    throw new Error(`example HTML and figure catalog differ; extra=${extra.join(',')} missing=${missing.join(',')}`);
  }
}

function assertIcons(dir) {
  const ico = fs.readFileSync(path.join(dir, 'favicon.ico'));
  const svg = fs.readFileSync(path.join(dir, 'favicon.svg'), 'utf8');
  const apple = fs.readFileSync(path.join(dir, 'apple-touch-icon.png'));
  if (ico.readUInt16LE(0) !== 0 || ico.readUInt16LE(2) !== 1) throw new Error('favicon.ico is not an ICO');
  if (!svg.startsWith('<svg') || !svg.includes('data:image/png;base64,')) throw new Error('favicon.svg is not derived from the PNG icon');
  if (apple.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('apple-touch-icon.png is not a PNG');
  for (const name of ['robots.txt', 'sitemap.xml', 'share.png', 'geogebra-icon.png']) {
    if (name === 'geogebra-icon.png' && !fs.existsSync(path.join(dir, name))) continue;
    if (!fs.existsSync(path.join(dir, name))) throw new Error(`missing ${name}`);
  }
}

function assertHomepage(dir, { requireBrandIcon = false } = {}) {
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const required = [
    `<title>${HOME_TITLE}</title>`,
    `<meta name="description" content="${HOME_DESCRIPTION}">`,
    '<link rel="canonical" href="https://yzdame.github.io/GeoGebra-Studio/">',
    '<meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)">',
    '<meta name="theme-color" content="#161616" media="(prefers-color-scheme: dark)">',
    'href="favicon.ico"',
    'href="favicon.svg"',
    'href="apple-touch-icon.png"',
    '<meta property="og:site_name" content="GeoGebra Studio">',
    '<meta property="og:locale" content="zh_CN">',
    '<meta property="og:locale:alternate" content="en_US">',
    '<meta property="og:url" content="https://yzdame.github.io/GeoGebra-Studio/">',
    `<meta property="og:title" content="${HOME_TITLE}">`,
    `<meta property="og:description" content="${HOME_DESCRIPTION}">`,
    '<meta property="og:image" content="https://yzdame.github.io/GeoGebra-Studio/share.png">',
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta property="og:image:alt" content="GeoGebra Studio 首页截图，大标题是 AI Agent + GeoGebra = ？">',
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${HOME_TITLE}">`,
    `<meta name="twitter:description" content="${HOME_DESCRIPTION}">`,
    '<meta name="twitter:image" content="https://yzdame.github.io/GeoGebra-Studio/share.png">',
    '<meta name="twitter:image:alt" content="GeoGebra Studio 首页截图，大标题是 AI Agent + GeoGebra = ？">',
    '<script type="application/ld+json">',
    '"@type": "WebSite"',
    '"@type": ["SoftwareApplication", "SoftwareSourceCode"]',
    '"license": "https://github.com/YZDame/GeoGebra-Studio/blob/main/LICENSE"',
    '"codeRepository": "https://github.com/YZDame/GeoGebra-Studio"',
    '不是 GeoGebra 官方产品，与 GeoGebra 无隶属关系。'
  ];
  for (const snippet of required) {
    if (!html.includes(snippet)) throw new Error(`homepage missing ${snippet}`);
  }
  if (/"@type":\s*"AggregateRating"|ratingValue|reviewCount|interactionStatistic/.test(html)) {
    throw new Error('homepage JSON-LD includes invented social proof');
  }
  const jsonLd = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
  if (!jsonLd) throw new Error('homepage JSON-LD block is missing');
  const structured = JSON.parse(jsonLd[1]);
  const types = structured['@graph'].map((node) => node['@type']);
  if (types.length !== 2 || types[0] !== 'WebSite' || JSON.stringify(types[1]) !== JSON.stringify(['SoftwareApplication', 'SoftwareSourceCode'])) {
    throw new Error('homepage JSON-LD graph is not WebSite plus SoftwareApplication');
  }
  const robots = fs.readFileSync(path.join(dir, 'robots.txt'), 'utf8');
  if (!robots.includes('Sitemap: https://yzdame.github.io/GeoGebra-Studio/sitemap.xml')) {
    throw new Error('robots.txt is missing the sitemap URL');
  }
  assertSitemap(path.join(dir, 'sitemap.xml'));
  assertIcons(dir);
  if (requireBrandIcon && !fs.existsSync(path.join(dir, 'geogebra-icon.png'))) {
    throw new Error('published site is missing geogebra-icon.png');
  }
}

function stampHtml(html, figure) {
  if (!html.startsWith(`<!doctype html>\n<html lang="${figure.lang}">`)) {
    throw new Error(`${figure.file} is not lang=${figure.lang}`);
  }
  const styleAt = html.indexOf('<style>');
  if (styleAt < 0) throw new Error(`${figure.file} has no viewer style`);
  const tail = html.slice(styleAt);
  const title = `${figure.title} · GeoGebra Studio`;
  const canonical = `${ORIGIN}/figures/${figure.file}`;
  const description = escapeHtml(figure.description);
  const expectedTitle = `<title>${escapeHtml(title)}</title>`;
  const expectedCanonical = `<link rel="canonical" href="${canonical}">`;
  if (html.includes(expectedCanonical)) {
    if (!html.includes(expectedTitle) || !html.includes(`content="${description}"`)) {
      throw new Error(`${figure.file} already has a canonical URL with different metadata`);
    }
    if (html.slice(html.indexOf('<style>')) !== tail) throw new Error(`${figure.file} viewer markup changed`);
    return html;
  }
  const marker = '<meta name="color-scheme" content="light dark"><title>GeoGebra</title>\n';
  const occurrences = html.split(marker).length - 1;
  if (occurrences !== 1) throw new Error(`${figure.file} does not have exactly one generic title`);
  const block = [
    '<meta name="color-scheme" content="light dark">',
    expectedTitle,
    `<meta name="description" content="${description}">`,
    expectedCanonical,
    `<link rel="icon" href="${ORIGIN}/favicon.ico" sizes="16x16 32x32 48x48">`,
    `<link rel="icon" href="${ORIGIN}/favicon.svg" type="image/svg+xml">`,
    ''
  ].join('\n');
  const next = html.replace(marker, block);
  if (next.slice(next.indexOf('<style>')) !== tail) throw new Error(`${figure.file} viewer markup changed`);
  if (next.includes('<title>GeoGebra</title>')) throw new Error(`${figure.file} still has a generic title`);
  return next;
}

function stampDir(dir) {
  const figuresDir = path.join(dir, 'figures');
  const present = fs.readdirSync(figuresDir).filter((name) => name.endsWith('.html')).sort();
  const listed = FIGURES.map((figure) => figure.file).sort();
  if (present.join('\n') !== listed.join('\n')) {
    throw new Error(`published figures do not match the catalog: ${present.join(',')}`);
  }
  for (const figure of FIGURES) {
    const file = path.join(figuresDir, figure.file);
    const html = fs.readFileSync(file, 'utf8');
    fs.writeFileSync(file, stampHtml(html, figure));
  }
}

const target = process.argv[2];
assertExamplesCovered();
if (!target) {
  assertHomepage(path.join(ROOT, 'site'));
  console.log(`checked site/ (${FIGURES.length} figure URLs in the sitemap)`);
} else {
  stampDir(path.resolve(target));
  assertHomepage(path.resolve(target), { requireBrandIcon: true });
  console.log(`stamped ${path.resolve(target)} (${FIGURES.length} figures)`);
}
