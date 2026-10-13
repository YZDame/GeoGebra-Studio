import { mkdir, realpath, lstat, writeFile } from 'fs/promises';
import path from 'path';
import { currentWorkspace } from './workspace';

/** Restrict new export destinations, including existing ancestor symlinks, to workspace. */
export async function saveFile(filename: unknown, content: string | Uint8Array): Promise<string | undefined> {
  if (filename === undefined) return undefined;
  if (typeof filename !== 'string' || !filename.trim()) throw new Error('filename must be a nonempty string');
  const root = await realpath(currentWorkspace());
  const target = path.resolve(root,filename);
  const inside = (s: string) => s.startsWith(root+path.sep);
  if (!inside(target)) throw new Error('Export path is outside workspace');
  // Validate every existing component before creating directories.
  let current=root;
  for (const part of path.relative(root,target).split(path.sep)) {
    current=path.join(current,part);
    try { const stat=await lstat(current); if(stat.isSymbolicLink()) throw new Error('Export paths may not contain symbolic links'); }
    catch(e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; }
  }
  await mkdir(path.dirname(target),{recursive:true});
  if (!inside(await realpath(path.dirname(target))) && path.dirname(target)!==root) throw new Error('Export parent is outside workspace');
  await writeFile(target,content,{flag:'wx'});
  return target;
}

export const saveText = (filename: unknown, content: string) => saveFile(filename,content);
