import { XMLParser, XMLValidator } from 'fast-xml-parser';

export interface SceneObject {
  name: string;
  type: string;
  visible: boolean;
  labelVisible: boolean;
  caption: string;
  coordinates?: [number, number];
  command?: { name: string; inputs: string[]; outputs: string[] };
  expression?: string;
  style: { color: [number, number, number]; thickness: number; dash: number; pointSize: number; pointStyle: number; fill: number };
}
export interface SemanticScene { schemaVersion: '1.0'; source: 'geogebra-xml'; xml: string; objects: SceneObject[]; }
const array = (value: any): any[] => value === undefined ? [] : Array.isArray(value) ? value : [value];
const inputs = (value: Record<string, string> = {}) => Object.keys(value).filter(k => /^a\d+$/.test(k)).sort((a,b) => Number(a.slice(1))-Number(b.slice(1))).map(k => value[k]!);
const number = (v: unknown, fallback: number) => Number.isFinite(Number(v)) ? Number(v) : fallback;

/** Preserve command edges as well as evaluated coordinates and appearance. */
export function sceneFromXML(xml: string): SemanticScene {
  if (xml.length > 20_000_000 || /<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('XML is too large or contains a forbidden document declaration');
  if (XMLValidator.validate(xml) !== true) throw new Error('Malformed GeoGebra XML');
  const doc = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '', parseTagValue: false }).parse(xml);
  const construction = doc.geogebra?.construction;
  if (!construction) throw new Error('Expected GeoGebra construction XML');
  const commands = new Map<string, SceneObject['command']>();
  for (const c of array(construction.command)) {
    const command = { name: String(c.name), inputs: inputs(c.input), outputs: inputs(c.output) };
    for (const output of command.outputs) commands.set(output, command);
  }
  const expressions = new Map(array(construction.expression).map(e => [String(e.label), String(e.exp)]));
  const objects: SceneObject[] = array(construction.element).map(e => {
    const obj: SceneObject = {
      name: String(e.label), type: String(e.type), visible: e.show?.object !== 'false',
      labelVisible: e.show?.label === 'true', caption: String(e.caption?.val ?? e.label),
      style: {
        color: [number(e.objColor?.r,0),number(e.objColor?.g,0),number(e.objColor?.b,0)],
        thickness: number(e.lineStyle?.thickness,2), dash: number(e.lineStyle?.type,0),
        pointSize: number(e.pointSize?.val,2), pointStyle: number(e.pointStyle?.val,0), fill: number(e.objColor?.alpha,0),
      },
    };
    const command = commands.get(obj.name);
    if (command) obj.command = command;
    const expression = expressions.get(obj.name);
    if (expression) obj.expression = expression;
    if (e.coords && obj.type === 'point') {
      const z = number(e.coords.z,1);
      const x = Number(e.coords.x)/z, y = Number(e.coords.y)/z;
      if (Number.isFinite(x) && Number.isFinite(y)) obj.coordinates = [x,y];
    }
    return obj;
  });
  return { schemaVersion: '1.0', source: 'geogebra-xml', xml, objects };
}

export type SourceFormat = 'tikz' | 'asymptote' | 'tsqx';
export interface SourceResult {
  format: SourceFormat;
  code: string;
  complete: boolean;
  warnings: string[];
  coordinateFallbacks: string[];
  unsupportedObjects: string[];
  semantics: 'preserved-subset' | 'partial';
}

/** Deliberately small semantic backend. Unsupported relations remain visible in the report. */
export function exportSource(scene: SemanticScene, format: SourceFormat, strict = true, standalone = true): SourceResult {
  const warnings: string[] = [], coordinateFallbacks: string[] = [], unsupportedObjects: string[] = [];
  const definitions: string[] = [], drawings: string[] = [], markers: string[] = [];
  const names = new Map(scene.objects.map((o,i) => [o.name, `g${i}`]));
  const byName = new Map(scene.objects.map(o => [o.name,o]));
  const emitted = new Set<string>(), visiting = new Set<string>();
  const id = (s: string) => names.get(s)!;
  const n = (x: number) => Number(x.toPrecision(12)).toString();
  const fail = (o: SceneObject, why: string) => { unsupportedObjects.push(o.name); warnings.push(`${o.name}: ${why}`); };
  const point = (name: string): boolean => byName.get(name)?.type === 'point' && emit(byName.get(name)!);
  const asyColor = (o: SceneObject) => `rgb(${o.style.color.map(c=>n(c/255)).join(',')})`;
  const pen = (o: SceneObject) => `${asyColor(o)}+linewidth(${n(o.style.thickness/2)}bp)${o.style.dash ? '+dashed' : ''}`;
  const tikzStyle = (o: SceneObject) => `draw={rgb,255:red,${o.style.color[0]};green,${o.style.color[1]};blue,${o.style.color[2]}},line width=${n(o.style.thickness/2)}pt${o.style.dash ? ',dashed' : ''}`;
  const raw = (s: string) => format === 'tsqx' ? `!${s}` : s;

  function emit(o: SceneObject): boolean {
    if (emitted.has(o.name)) return true;
    if (visiting.has(o.name)) { fail(o,'cyclic dependency'); return false; }
    visiting.add(o.name);
    const key = id(o.name), c = o.command, args = c?.inputs ?? [];
    if (o.type === 'point') {
      let expr: string | undefined;
      if (c?.name === 'Midpoint' && args.length === 2 && args.every(point)) {
        expr = format === 'tsqx' ? `midpoint ${id(args[0]!)} ${id(args[1]!)}` : format === 'tikz' ? `($(${id(args[0]!)})!0.5!(${id(args[1]!)})$)` : `(${id(args[0]!)}+${id(args[1]!)})/2`;
      } else if (!c && o.coordinates) {
        expr = `(${o.coordinates.map(n).join(',')})`;
        if (o.expression && !/^\(\s*[-+\d.eE]+\s*,\s*[-+\d.eE]+\s*\)$/.test(o.expression)) {
          warnings.push(`${o.name}: original algebraic expression is retained in XML; source uses evaluated coordinates`);
          coordinateFallbacks.push(o.name);
        }
      } else if (o.coordinates && !strict) {
        expr = `(${o.coordinates.map(n).join(',')})`;
        coordinateFallbacks.push(o.name);
        warnings.push(`${o.name}: ${c?.name ?? 'undefined point'} frozen to evaluated coordinates`);
      }
      if (!expr) { fail(o,`unsupported or undefined point definition ${c?.name ?? ''}`); visiting.delete(o.name); return false; }
      definitions.push(format === 'tikz' ? `\\coordinate (${key}) at ${expr};` : format === 'tsqx' ? `${key} : = ${expr}` : `pair ${key}=${expr};`);
      if (o.visible) {
        if (o.style.pointStyle !== 0) warnings.push(`${o.name}: point marker normalized to filled dot`);
        if (format === 'tikz') markers.push(`\\fill[${tikzStyle(o).replace('draw=','fill=')}] (${key}) circle (${n(o.style.pointSize/2)}pt);`);
        else markers.push(raw(`dot(${key},${asyColor(o)}+linewidth(${n(o.style.pointSize/3)}bp));`));
        if (o.labelVisible) {
          const caption = o.caption.replace(/^\$|\$$/g,'');
          if (format === 'tikz') markers.push(`\\node[above right] at (${key}) {$${caption}$};`);
          else markers.push(raw(`label(${JSON.stringify('$'+caption+'$')},${key},NE,${asyColor(o)});`));
        }
      }
    } else if (c && ['Segment','Polygon','Circle'].includes(c.name) && args.every(point)) {
      const refs = args.map(id);
      if (c.name === 'Segment' && refs.length === 2) {
        if (o.visible) drawings.push(format === 'tikz' ? `\\draw[${tikzStyle(o)}] (${refs[0]})--(${refs[1]});` : raw(`draw(${refs.join('--')},${pen(o)});`));
      } else if (c.name === 'Polygon' && refs.length >= 3 && c.outputs[0] === o.name) {
        if (o.visible) {
          const route = format === 'tikz' ? refs.map(r=>`(${r})`).join('--')+'--cycle' : refs.join('--')+'--cycle';
          drawings.push(format === 'tikz' ? `\\path[${tikzStyle(o)},fill={rgb,255:red,${o.style.color[0]};green,${o.style.color[1]};blue,${o.style.color[2]}},fill opacity=${n(o.style.fill)}] ${route};` : raw(o.style.fill > 0 ? `filldraw(${route},${asyColor(o)}+opacity(${n(o.style.fill)}),${pen(o)});` : `draw(${route},${pen(o)});`));
        }
      } else if (c.name === 'Circle' && refs.length === 3) {
        const positions = args.map(a=>byName.get(a)?.coordinates);
        if (positions.every(p=>p!==undefined)) {
          const [a,b,d] = positions as [number,number][];
          const determinant=(b![0]-a![0])*(d![1]-a![1])-(b![1]-a![1])*(d![0]-a![0]);
          if (determinant === 0) { fail(o,'three-point circle is degenerate'); visiting.delete(o.name); return false; }
        }
        const center = `${key}center`;
        if (format === 'tikz') {
          // Work in centimetres to keep PGF's fixed-point intermediates small.
          const x = (i: number) => `(\\x${i}/1cm)`, y = (i: number) => `(\\y${i}/1cm)`;
          const q = (i: number) => `(${x(i)}*${x(i)}+${y(i)}*${y(i)})`;
          const denominator = `(2*(${x(1)}*(${y(2)}-${y(3)})+${x(2)}*(${y(3)}-${y(1)})+${x(3)}*(${y(1)}-${y(2)})))`;
          const cx = `(${q(1)}*(${y(2)}-${y(3)})+${q(2)}*(${y(3)}-${y(1)})+${q(3)}*(${y(1)}-${y(2)}))/${denominator}`;
          const cy = `(${q(1)}*(${x(3)}-${x(2)})+${q(2)}*(${x(1)}-${x(3)})+${q(3)}*(${x(2)}-${x(1)}))/${denominator}`;
          definitions.push(`\\path let \\p1=(${refs[0]}),\\p2=(${refs[1]}),\\p3=(${refs[2]}) in coordinate (${center}) at ({${cx}},{${cy}});`);
          if (o.visible) drawings.push(`\\draw[${tikzStyle(o)}] let \\p1=($(${refs[0]})-(${center})$) in (${center}) circle ({veclen(\\x1,\\y1)});`);
        } else {
          definitions.push(raw(`pair ${center}=ggbCircumcenter(${refs.join(',')});`));
          if (o.visible) drawings.push(raw(`draw(circle(${center},abs(${refs[0]}-${center})),${pen(o)});`));
        }
      } else if (c.name === 'Circle' && refs.length === 2) {
        if (o.visible) drawings.push(format === 'tikz' ? `\\draw[${tikzStyle(o)}] let \\p1=($(${refs[1]})-(${refs[0]})$) in (${refs[0]}) circle ({veclen(\\x1,\\y1)});` : raw(`draw(circle(${refs[0]},abs(${refs[1]}-${refs[0]})),${pen(o)});`));
      } else { fail(o,`unsupported ${c.name} overload`); visiting.delete(o.name); return false; }
      if (o.labelVisible) warnings.push(`${o.name}: non-point label retained in XML but not drawn`);
      if (o.style.fill && c.name === 'Circle') warnings.push(`${o.name}: circle fill omitted`);
    } else {
      // Polygon side outputs have their own segment elements but share Polygon's command.
      if (o.type === 'segment' && c?.name === 'Polygon' && c.outputs.indexOf(o.name)>0) {
        const side=c.outputs.indexOf(o.name)-1, a=args[side], b=args[(side+1)%args.length];
        if (a && b) {
          const replacement: SceneObject = {...o, command:{name:'Segment',inputs:[a,b],outputs:[o.name]}};
          visiting.delete(o.name); return emit(replacement);
        }
      }
      fail(o,`unsupported ${o.type} / ${c?.name ?? 'expression'}`); visiting.delete(o.name); return false;
    }
    visiting.delete(o.name); emitted.add(o.name); return true;
  }
  for (const o of scene.objects.filter(o=>o.visible)) emit(o);
  if (unsupportedObjects.length || coordinateFallbacks.length) warnings.push('Use the original XML and geometry-export skill to reconstruct the remaining relations.');
  warnings.push('GeoGebra marker and stroke sizes are approximated in TeX points; verify the print scale.');
  if (scene.objects.some(o=>o.visible&&o.labelVisible)) warnings.push('Label positions use a default offset; review against the GeoGebra rendering.');
  if (scene.objects.some(o=>o.visible&&o.style.dash)) warnings.push('Non-solid line patterns are normalized to dashed.');
  let code: string;
  if (format === 'tikz') {
    const fragment = ['\\begin{tikzpicture}[line cap=round,line join=round]',...definitions,...drawings,...markers,'\\end{tikzpicture}'].join('\n');
    code = standalone ? `\\documentclass[tikz,border=3pt]{standalone}\n\\usetikzlibrary{calc}\n\\begin{document}\n${fragment}\n\\end{document}\n` : fragment;
  } else {
    const header = format === 'tsqx' ? ['# Mixed TSQX/Asymptote: native point definitions, explicit style/label drawing', '!import graph;', '!size(10cm);','!pair midpoint(pair a,pair b){ return (a+b)/2; }'] : ['import graph;','size(10cm);'];
    const helper = raw('pair ggbCircumcenter(pair a,pair b,pair c){ real d=2*(a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y)); return ((dot(a,a)*(b.y-c.y)+dot(b,b)*(c.y-a.y)+dot(c,c)*(a.y-b.y))/d,(dot(a,a)*(c.x-b.x)+dot(b,b)*(a.x-c.x)+dot(c,c)*(b.x-a.x))/d); }');
    code = [...header,helper,...definitions,...drawings,...markers].join('\n')+'\n';
  }
  const complete = unsupportedObjects.length===0 && coordinateFallbacks.length===0;
  if (strict && !complete) throw new Error(`Semantic export requires review: ${warnings.join('; ')}. Use strict=false for an explicitly partial draft.`);
  return { format,code,complete,warnings,coordinateFallbacks,unsupportedObjects,semantics:complete?'preserved-subset':'partial' };
}
