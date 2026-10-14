import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import {buildArtifact} from '../../src/studio/artifact';
import {GeoGebraInstance} from '../../src/utils/geogebra-instance';
jest.mock('../../src/utils/geogebra-instance',()=>({GeoGebraInstance:jest.fn()}));
describe('Atomic Studio artifact',()=>{
 let root:string,previous:string|undefined,engine:any;
 beforeEach(async()=>{
  root=await fs.mkdtemp(path.join(os.tmpdir(),'studio-artifact-unit-'));previous=process.env['VSCODE_WORKSPACE_FOLDER'];process.env['VSCODE_WORKSPACE_FOLDER']=root;
  engine={getConstructionXML:jest.fn().mockResolvedValue('<geogebra><construction/></geogebra>'),initialize:jest.fn(),renderHtml:jest.fn(),debugEvaluate:jest.fn().mockResolvedValue({objects:1,undefinedVisibleObjects:[]}),exportGGB:jest.fn().mockResolvedValue(Buffer.from('PKfixture').toString('base64')),getAllObjectNames:jest.fn().mockResolvedValue(['A']),capturePreview:jest.fn().mockResolvedValue(Buffer.from('preview')),cleanup:jest.fn()};
  (GeoGebraInstance as jest.Mock).mockImplementation(()=>engine);
 });
 afterEach(async()=>{if(previous===undefined)delete process.env['VSCODE_WORKSPACE_FOLDER'];else process.env['VSCODE_WORKSPACE_FOLDER']=previous;await fs.rm(root,{recursive:true,force:true});});
 test('reopens the saved final HTML, verifies equal axes and captures a preview',async()=>{
  engine.debugEvaluate.mockReset().mockResolvedValueOnce({objects:1,undefinedVisibleObjects:[]}).mockResolvedValueOnce({ready:true,error:null,equalAxes:true,viewWidth:800,viewHeight:600});
  const result=await buildArtifact({commands:['A=(1,2)'],filename:'figure.html'});
  expect(engine.renderHtml).toHaveBeenCalledTimes(2);expect(engine.cleanup).toHaveBeenCalled();
  expect(engine.debugEvaluate).toHaveBeenCalledTimes(2);
  expect(result.structuredContent.renderVerified).toBe(true);expect(result.structuredContent.layoutChecks).toMatchObject({loaded:true,equalAxes:true});
  expect(result.structuredContent.packedGgbVerified).toBe(true);
  expect(await fs.readFile(path.join(root,'figure.html'),'utf8')).toContain('ggbBase64');
 });
 test('does not deliver HTML when the saved viewer fails verification',async()=>{
  engine.debugEvaluate.mockReset().mockResolvedValueOnce({objects:1,undefinedVisibleObjects:[]}).mockResolvedValueOnce({ready:false,error:'applet failed',equalAxes:false,viewWidth:0,viewHeight:0});
  await expect(buildArtifact({commands:['A=(1,2)'],filename:'figure.html'})).rejects.toThrow('Final HTML viewer verification failed');
  expect(await fs.readdir(root)).toEqual([]);expect(engine.cleanup).toHaveBeenCalled();
 });
 test('rejects undefined visible objects without files',async()=>{
  engine.debugEvaluate.mockResolvedValue({objects:1,undefinedVisibleObjects:['A']});
  await expect(buildArtifact({commands:['A=(1,2)'],filename:'figure.html'})).rejects.toThrow('Undefined');
  expect(await fs.readdir(root)).toEqual([]);expect(engine.cleanup).toHaveBeenCalled();
 });
 test('rejects packed round-trip data loss',async()=>{
  engine.debugEvaluate.mockReset().mockResolvedValueOnce({objects:1,undefinedVisibleObjects:[]}).mockResolvedValueOnce({ready:true,error:null,equalAxes:true,viewWidth:800,viewHeight:600});
  engine.getAllObjectNames.mockResolvedValue([]);
  await expect(buildArtifact({commands:['A=(1,2)'],filename:'figure.html'})).rejects.toThrow('round trip');expect(await fs.readdir(root)).toEqual([]);
 });
 test('never overwrites existing HTML and rolls back its new preview',async()=>{
  await fs.writeFile(path.join(root,'figure.html'),'original');
  await expect(buildArtifact({commands:['A=(1,2)'],filename:'figure.html'})).rejects.toThrow();
  expect(await fs.readFile(path.join(root,'figure.html'),'utf8')).toBe('original');expect(await fs.readdir(root)).toEqual(['figure.html']);
 });
 test('rejects path traversal',async()=>{
  await expect(buildArtifact({commands:['A=(1,2)'],filename:'../figure.html'})).rejects.toThrow('outside workspace');expect(await fs.readdir(root)).toEqual([]);
 });
});
