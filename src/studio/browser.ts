import path from 'path';
import os from 'os';
import { existsSync, readFileSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import puppeteer from 'puppeteer-core';
const {PUPPETEER_REVISIONS}=require('puppeteer-core') as {PUPPETEER_REVISIONS:{chrome:string}};
import { Browser, computeExecutablePath, install } from '@puppeteer/browsers';
export const browserCache = () => path.join(process.env['GEOGEBRA_STUDIO_HOME'] || path.join(os.homedir(),'.cache','geogebra-studio'),'browsers');
export const managedBrowserPath = () => computeExecutablePath({cacheDir:browserCache(),browser:Browser.CHROME,buildId:PUPPETEER_REVISIONS.chrome});
export function browserCandidates(): string[] {
  const explicit=process.env['PUPPETEER_EXECUTABLE_PATH'];
  if(explicit)return [explicit];
  return [
    ...(process.platform==='darwin'?['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',path.join(os.homedir(),'Applications/Google Chrome.app/Contents/MacOS/Google Chrome')]:[]),
    ...(process.platform==='win32'?[process.env['PROGRAMFILES'],process.env['PROGRAMFILES(X86)'],process.env['LOCALAPPDATA']].filter((v):v is string=>!!v).map(v=>path.join(v,'Google','Chrome','Application','chrome.exe')):[]),
    ...(process.platform==='linux'?['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser']:[]),
    managedBrowserPath(),
  ].filter((value,index,all)=>all.indexOf(value)===index);
}
/** Runtime lookup is cheap; installation/doctor additionally probes launch compatibility. */
export function resolveBrowser(): string {
  if(!process.env['PUPPETEER_EXECUTABLE_PATH']){try{const selected=readFileSync(path.join(browserCache(),'selected.txt'),'utf8').trim();if(existsSync(selected))return selected;}catch{/* No prepared runtime yet. */}}
  const executable=browserCandidates().find(file=>existsSync(file));
  if(!executable)throw new Error('Chrome is unavailable. Run: npx @lydt/geogebra-studio browser install');
  return executable;
}
async function rememberBrowser(file:string):Promise<string>{await mkdir(browserCache(),{recursive:true});await writeFile(path.join(browserCache(),'selected.txt'),file,'utf8');return file;}
export async function prepareBrowser(download=false): Promise<string> {
  const failures:string[]=[];
  for(const file of browserCandidates().filter(file=>existsSync(file))){
    try{const browser=await puppeteer.launch({executablePath:file,headless:true,timeout:15000});await browser.close();return rememberBrowser(file);}
    catch(error){failures.push(`${file}: ${error instanceof Error?error.message:String(error)}`);}
  }
  if(!download)throw new Error('No usable Chrome. Run: npx @lydt/geogebra-studio browser install. '+failures.join('; '));
  const installed=await install({browser:Browser.CHROME,buildId:PUPPETEER_REVISIONS.chrome,cacheDir:browserCache()});
  const browser=await puppeteer.launch({executablePath:installed.executablePath,headless:true,timeout:15000});await browser.close();
  return rememberBrowser(installed.executablePath);
}
