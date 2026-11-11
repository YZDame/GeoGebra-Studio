const { writeFileSync } = require('node:fs');
const { join } = require('node:path');

const examples = join(__dirname, '..', 'examples');
const round = (value) => +value.toFixed(5);
const point = (values) => '(' + values.map(round).join(',') + ')';

function write(name, title, commands, options = {}) {
  const spec = { filename: name + '.html', title, commands, ...options };
  writeFileSync(join(examples, name + '.json'), JSON.stringify(spec, null, 2) + '\n');
}

// Escape-time sampling of z ↦ z² + c, using 60 iterations on a bounded grid.
// Merge adjacent cells into horizontal runs to keep the GeoGebra object count low.
const step = 0.016;
function survives(cx, cy) {
  let x = 0;
  let y = 0;
  for (let i = 0; i < 60; i++) {
    [x, y] = [x*x - y*y + cx, 2*x*y + cy];
    if (x*x + y*y > 4) return false;
  }
  return true;
}

const runs = [];
for (let row = -75; row <= 75; row++) {
  const y = row * step;
  let start = null;
  for (let col = 0; col <= 176; col++) {
    const x = -2.06 + col * step;
    if (col < 176 && survives(x, y)) {
      start ??= x - step / 2;
    } else if (start !== null) {
      runs.push('Segment(' + point([start, y]) + ',' + point([x - step / 2, y]) + ')');
      start = null;
    }
  }
}

const mandelbrot = [];
for (let offset = 0; offset < runs.length; offset += 100) {
  const label = 'slice' + (offset / 100 + 1);
  mandelbrot.push(label + '={' + runs.slice(offset, offset + 100).join(',') + '}',
    'SetColor(' + label + ',"#386E98")', 'SetLineThickness(' + label + ',3)');
}
mandelbrot.push(
  'C=(-0.49,0.52)',
  'orbit=IterationList((x(P)^2-y(P)^2+x(C),2*x(P)*y(P)+y(C)),P,{(0,0)},12)',
  'SetColor(orbit,"#B35A4C")', 'SetPointSize(orbit,3)',
  'SetColor(C,"#B35A4C")', 'SetPointSize(C,5)',
  'ZoomIn(-2.3,-1.35,0.9,1.35)',
);
write('mandelbrot', 'Mandelbrot set / 曼德博集合', mandelbrot, { showAxes: true, visibleLabels: ['C'] });

// Classical Lorenz parameters (10, 28, 8/3). RK4 at dt=0.01,
// keeping every third point after a short transient.
function derivative([x, y, z]) {
  return [10*(y-x), x*(28-z)-y, x*y-8*z/3];
}

const dt = 0.01;
const advance = (state, rate, fraction) => state.map((value, i) => value + dt*fraction*rate[i]);
const samples = [];
let state = [1, 1, 1];
for (let i = 0; i < 3300; i++) {
  const a = derivative(state);
  const b = derivative(advance(state, a, 0.5));
  const c = derivative(advance(state, b, 0.5));
  const d = derivative(advance(state, c, 1));
  state = state.map((value, j) => value + dt*(a[j] + 2*b[j] + 2*c[j] + d[j])/6);
  if (i >= 300 && i % 3 === 0) samples.push(point(state));
}

const lorenz = [];
for (let offset = 0; offset < samples.length - 1; offset += 140) {
  const label = 'orbit' + (offset / 140 + 1);
  lorenz.push(label + '=Polyline({' + samples.slice(offset, offset + 141).join(',') + '})',
    'SetColor(' + label + ',"#386E98")', 'SetLineThickness(' + label + ',2)');
}
write('lorenz-attractor', 'Lorenz attractor / 洛伦兹吸引子', lorenz, {
  mode: '3D',
  showAxes: true,
  view3D: { bounds: [-24, 24, -31, 31, -4, 53], direction: [0.7, -2.5, 0.8] },
});
