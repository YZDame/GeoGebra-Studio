#!/usr/bin/env node
/** Portable local CLI. No MCP transport or persistent service. */
import { readFile } from 'fs/promises';
import path from 'path';

const metadata = require('../package.json') as { name:string; version:string };
function help() {
  console.log(`GeoGebra Studio ${metadata.version} — local geometry Skill
Usage:
  geogebra-studio generate --input SPEC.json --workspace ABS_DIR [--output FILE.html] [--verify]
  geogebra-studio export --input CONSTRUCTION.xml --format tsqx|asymptote --workspace ABS_DIR --output FILE
  geogebra-studio export --input NATIVE.pgf --format tikz --workspace ABS_DIR --output FILE.tex
  geogebra-studio doctor
  geogebra-studio browser install                 Optional browser-based verification
  geogebra-studio install [--local]              Optional Codex plugin installation
The generated HTML uses official GeoGebra assets and requires internet access.`);
}
function flags(args:string[],allowed:string[]) {
  const options: Record<string,string>={};
  for(let i=0;i<args.length;i++){
    const arg=args[i]!;
    if(!allowed.includes(arg)||!args[i+1]||args[i+1]!.startsWith('--')||options[arg])throw Error('Invalid or duplicate option: '+arg);
    options[arg]=args[++i]!;
  }
  return options;
}
async function main(){
  const [command,...args]=process.argv.slice(2);
  if(!command||command==='--help'||command==='-h'){help();return;}
  if(command==='--version'||command==='-v'){console.log(metadata.version);return;}
  if(command==='generate'){
    const verify=args.includes('--verify');
    const options=flags(args.filter(x=>x!=='--verify'),['--input','--workspace','--output']);
    if(!options['--input']||!options['--workspace'])throw Error('generate requires --input and --workspace');
    const {validateViewerSpec,generateViewer}=await import('./studio/generate');
    const spec=validateViewerSpec(JSON.parse(await readFile(options['--input'],'utf8')));
    if(options['--output'])spec.filename=options['--output'];
    validateViewerSpec(spec);
    if(verify){
      const {inWorkspace}=await import('./export/workspace');
      const {buildArtifact}=await import('./studio/artifact');
      const result=await inWorkspace(options['--workspace'],()=>buildArtifact(spec));
      const {html:unusedHtml,constructionXml:unusedXml,...summary}=result.structuredContent;
      void unusedHtml;void unusedXml;
      console.log(JSON.stringify(summary));
    }else console.log(JSON.stringify(await generateViewer(spec,options['--workspace'])));
    return;
  }
  if(command==='export'){
    const o=flags(args,['--input','--format','--workspace','--output']);
    if(!o['--input']||!o['--format']||!o['--workspace']||!o['--output'])throw Error('export requires --input, --format, --workspace and --output');
    const format=o['--format'];if(!['tsqx','asymptote','tikz'].includes(format))throw Error('Unsupported format '+format);
    const source=await readFile(o['--input'],'utf8');
    let code:string;
    if(format==='tikz'){
      if(/<geogebra[\\s>]/.test(source))throw Error('For accurate TikZ use the viewer native PGF download; XML is for semantic TSQX/Asymptote export.');
      const {cleanWithGikz}=await import('./export/gikz');
      code=await cleanWithGikz(source,{standalone:true});
    }else{
      const {sceneFromXML,exportSource}=await import('./export/semantic');
      const result=exportSource(sceneFromXML(source),format as 'tsqx'|'asymptote',true,true);
      code=result.code;
    }
    const {inWorkspace}=await import('./export/workspace');
    const {saveText}=await import('./export/files');
    const filename=await inWorkspace(o['--workspace'],()=>saveText(o['--output'],code));
    console.log(JSON.stringify({success:true,format,filename,bytes:Buffer.byteLength(code)}));
    return;
  }
  if(command==='doctor'||command==='browser'){
    if(command==='doctor'&&args.length)throw Error('doctor takes no arguments');
    if(command==='browser'&&(args.length!==1||args[0]!=='install'))throw Error('Usage: browser install');
    const {cleanWithGikz}=await import('./export/gikz');
    await cleanWithGikz(String.raw`\\begin{tikzpicture}\\end{tikzpicture}`);
    const {constructionHtml}=await import('./export/html');
    constructionHtml({commands:['A=(0,0)']});
    if(command==='browser'){
      const {prepareBrowser}=await import('./studio/browser');
      console.log(JSON.stringify({success:true,executablePath:await prepareBrowser(true)}));
    }else console.log(JSON.stringify({success:true,version:metadata.version,chromeRequired:false,mcpRequired:false}));
    return;
  }
  if(command==='install'){
    if(args.some(a=>a!=='--local'))throw Error('Usage: install [--local]');
    const {installPlugin}=await import('./studio/install');await installPlugin(args.includes('--local'));return;
  }
  throw Error('Unknown command: '+command+'. Use --help.');
}
main().catch(e=>{console.error(e instanceof Error?e.message:String(e));process.exitCode=1;});
