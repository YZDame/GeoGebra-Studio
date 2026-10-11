import { spawn } from 'child_process';
import path from 'path';
import { realpath } from 'fs/promises';

/** Optional external GPL CLI. No vendored code or runtime require of Gikz. */
export async function cleanWithGikz(source: string, options: { standalone?: boolean; points?: boolean; labels?: boolean; round?: boolean } = {}): Promise<string> {
  const configured = process.env['GIKZ_CLI'];
  if (!configured || !path.isAbsolute(configured)) throw new Error('Set GIKZ_CLI to the absolute path of a separately installed Gikz gikz.js');
  const cli = await realpath(configured);
  if (source.length > 10_000_000) throw new Error('Gikz input exceeds 10 MB');
  const args = [cli];
  if (options.standalone) args.push('--standalone');
  if (options.points === false) args.push('--no-points');
  if (options.labels === false) args.push('--no-labels');
  if (options.round === false) args.push('--no-round');
  return new Promise((resolve,reject) => {
    const child = spawn(process.execPath,args,{stdio:['pipe','pipe','pipe'],shell:false});
    let output='', error='';
    const timer=setTimeout(()=>{child.kill();reject(new Error('Gikz exceeded 20 seconds'));},20_000);
    child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');
    child.stdout.on('data',chunk=>{output+=chunk;if(output.length>20_000_000){child.kill();reject(new Error('Gikz output exceeds 20 MB'));}});
    child.stderr.on('data',chunk=>{error=(error+chunk).slice(-4000);});
    child.once('error',e=>{clearTimeout(timer);reject(e);});
    child.once('close',code=>{clearTimeout(timer);code===0&&output.trim() ? resolve(output) : reject(new Error(`Gikz failed (${code}): ${error}`));});
    child.stdin.on('error',()=>undefined);
    child.stdin.end(source);
  });
}
