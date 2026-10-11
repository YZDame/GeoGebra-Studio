import { sceneFromXML,exportSource } from '../../src/export/semantic';
const point=(name:string,x:number,y:number)=>`<element label="${name}" type="point"><coords x="${x}" y="${y}" z="1"/><show object="true" label="true"/></element>`;
const xml=`<geogebra><construction>${point('A',0,0)}${point('B',4,0)}<command name="Midpoint"><input a0="A" a1="B"/><output a0="M"/></command>${point('M',2,0)}</construction></geogebra>`;
describe('semantic export boundaries',()=>{
  it('retains original relations and coordinates together',()=>{
    const scene=sceneFromXML(xml);
    expect(scene.xml).toBe(xml);
    expect(scene.objects.find(o=>o.name==='M')).toMatchObject({coordinates:[2,0],command:{name:'Midpoint',inputs:['A','B']}});
    for(const format of ['tikz','asymptote','tsqx'] as const) expect(exportSource(scene,format).complete).toBe(true);
  });
  it('refuses silent freezing, but offers an explicit partial draft',()=>{
    const scene=sceneFromXML(xml.replace('Midpoint','Intersect'));
    expect(()=>exportSource(scene,'tikz')).toThrow('requires review');
    expect(exportSource(scene,'tikz',false)).toMatchObject({complete:false,coordinateFallbacks:['M'],semantics:'partial'});
  });
  it('rejects malformed XML and declarations before parsing',()=>{
    expect(()=>sceneFromXML('<geogebra>')).toThrow('Malformed');
    expect(()=>sceneFromXML('<!DOCTYPE x><geogebra/>')).toThrow('forbidden');
  });
});
