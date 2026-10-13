// npm may accept a publish before scan completion makes the package installable.
// Check anonymously and compare the Registry payload against the exact packed artifact.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const p=require('../package.json');
(async()=>{
 const version=process.argv[2]||p.version;
 const expected=JSON.parse(await fs.readFile('release/package-report.json','utf8'));
 assert.equal(expected.version,version,'Local package report must match the version being verified');
 const route=p.name.replace('/','%2f');
 for(let attempt=1;attempt<=40;attempt++){
  const response=await fetch('https://registry.npmjs.org/'+route+'?studio_check='+Date.now(),{signal:AbortSignal.timeout(15000)});
  if(response.ok){
   const metadata=await response.json(),published=metadata.versions?.[version];
   if(published){
    assert.equal(published.dist.integrity,expected.sha512,'Public tarball differs from the verified artifact');
    const report={package:p.name,version,publicReadable:true,integrity:published.dist.integrity,tags:metadata['dist-tags'],checkedAt:new Date().toISOString()};
    await fs.mkdir('output/verification',{recursive:true});
    await fs.writeFile('output/verification/registry-publication.json',JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify(report));return;
   }
  }else if(response.status!==404&&response.status!==429&&response.status<500){
   throw Error('Public Registry returned HTTP '+response.status);
  }
  console.log('Waiting for public Registry availability: '+version+' (attempt '+attempt+'/40, HTTP '+response.status+')');
  if(attempt<40)await new Promise(resolve=>setTimeout(resolve,30000));
 }
 throw Error('Package accepted for publication but not publicly available within the verification window');
})().catch(error=>{console.error(error);process.exitCode=1});
