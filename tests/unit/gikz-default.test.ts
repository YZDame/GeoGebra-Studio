import { readFileSync } from 'fs';
import path from 'path';
import { constructionHtml } from '../../src/export/html';
import { cleanWithGikz } from '../../src/export/gikz';
import { exportTools } from '../../src/tools/export-tools';
import { appsApiTools } from '../../src/tools/apps-api-tools';
import { instancePool } from '../../src/tools/geogebra-tools';
jest.mock('puppeteer-core', () => ({__esModule:true,default:{launch:jest.fn()}}));
const raw = '\\begin{tikzpicture}\n\\clip(-6,-6) rectangle (6,6);\n\\draw [line width=1pt,color=black] (0,0) circle (5cm);\n\\draw [fill=black] (0,0) circle (1.5pt);\n\\draw [color=black](0.2,0.4) node[anchor=north west] {$\\mathit{O}$};\n\\end{tikzpicture}';
const find = (name:string) => exportTools.find(t=>t.tool.name===name)!;
describe('mandatory Gikz TikZ pipeline',()=>{
  afterEach(()=>jest.restoreAllMocks());
  it('cleans both MCP TikZ routes and the generic PGF bridge by default',async()=>{
    jest.spyOn(instancePool,'getDefaultInstance').mockResolvedValue({exportNativeTikZ:async()=>raw} as any);
    const expected=await cleanWithGikz(raw,{standalone:true});
    for(const name of ['geogebra_export_tikz','geogebra_export_source']){
      const response=await find(name).handler({format:'tikz'});
      expect(response.isError).not.toBe(true);
      expect(JSON.parse(response.content[0]!.text!)).toMatchObject({code:expected,cleaned:true,backend:'native-pgf+gikz',semantics:'visual-snapshot'});
    }
    const bridge=await appsApiTools.find(t=>t.tool.name==='geogebra_api_call')!.handler({method:'exportPGF',waitForCallbackIndex:0});
    expect(JSON.parse(bridge.content[0]!.text!)).toMatchObject({value:expected,cleaned:true});
    expect(expected).toContain('\\coordinate (O) at (0,0)');
    expect(expected).not.toContain('line width=');
  });
  it('uses built-in Gikz even if a legacy external path is broken; malformed input fails',async()=>{
    const previous=process.env['GIKZ_CLI'];process.env['GIKZ_CLI']=path.resolve('/tmp/absent-gikz/gikz.js');
    try{
      expect(await cleanWithGikz(raw)).toContain('circle (5cm)');
      expect(constructionHtml({commands:['A=(0,0)']})).toContain('gikz-browser');
      await expect(cleanWithGikz('not TikZ')).rejects.toThrow();
    }finally{if(previous===undefined)delete process.env['GIKZ_CLI'];else process.env['GIKZ_CLI']=previous;}
  });
  it('restores the live construction after exporting temporary XML, including failure',async()=>{
    const calls:unknown[]=[];
    jest.spyOn(instancePool,'getDefaultInstance').mockResolvedValue({getConstructionXML:async()=>'<geogebra><construction/></geogebra>',callAppsApi:async(...args:unknown[])=>{calls.push(args);},exportNativeTikZ:async()=>{throw new Error('native failure');}} as any);
    const xml='<geogebra><construction><element type="point" label="A"><coords x="0" y="0" z="1"/></element></construction></geogebra>';
    expect((await find('geogebra_export_tikz').handler({xml})).isError).toBe(true);
    expect(calls).toEqual([['setXML',[xml]],['setXML',['<geogebra><construction/></geogebra>']]]);
  });
  it('embeds the actual external cleaner and its GPL license without script injection',()=>{
    const html=constructionHtml({commands:['A=(0,0)']});
    expect(html).toContain('Gikz.wrapStandalone(Gikz.cleanTikZCode(source))');
    const source=html.match(/<script id="gikz-browser">([\s\S]*?)<\/script>/)![1]!;
    expect(source).toBe(readFileSync('dist/gikz-browser.js','utf8').replace(/<\/script/gi,'<\\/script'));
    expect(html).not.toContain('new Function(');
    expect(html).toContain('GNU GENERAL PUBLIC LICENSE');
  });
});
