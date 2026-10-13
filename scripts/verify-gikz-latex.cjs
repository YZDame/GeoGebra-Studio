const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

(async()=>{
 const sourcePath=process.argv[2]||'output/verification/geogebra_export_tikz-cleaned.tex';
 const source=await fs.readFile(sourcePath,'utf8');
 assert(source.includes('\\begin{document}')&&source.includes('\\begin{tikzpicture}'),'Expected a standalone TikZ document produced by native PGF and Gikz');
 const outputDir=process.env.STUDIO_LATEX_OUTPUT||'output/verification/gikz-compile';
 await fs.mkdir(outputDir,{recursive:true});
 const texPath=path.join(outputDir,'native-cleaned.tex');
 await fs.writeFile(texPath,source);
 execFileSync('latexmk',['-pdf','-interaction=nonstopmode','-halt-on-error','-outdir='+outputDir,texPath],{stdio:'pipe'});
 const pdfPath=path.join(outputDir,'native-cleaned.pdf');
 const pdf=await fs.readFile(pdfPath);
 assert(pdf.subarray(0,5).toString()==='%PDF-','latexmk did not create a PDF');
 assert(pdf.byteLength>1000,'Compiled PDF is unexpectedly small');
 console.log(JSON.stringify({nativePgfToGikz:true,latexmk:true,pdf:pdfPath,bytes:pdf.byteLength}));
})().catch(error=>{console.error(error);process.exitCode=1});
