import { AsyncLocalStorage } from 'async_hooks';
import { realpath, stat } from 'fs/promises';
import path from 'path';

const context=new AsyncLocalStorage<string>();
export const currentWorkspace=()=>context.getStore()||process.env['VSCODE_WORKSPACE_FOLDER']||process.cwd();

/** Keep the requested workspace scoped to one MCP call, including asynchronous exports. */
export async function inWorkspace<T>(workspace:unknown,operation:()=>Promise<T>):Promise<T>{
  if(workspace===undefined)return operation();
  if(typeof workspace!=='string'||!path.isAbsolute(workspace))throw new Error('workspace must be an absolute directory path');
  const root=await realpath(workspace);
  if(!(await stat(root)).isDirectory())throw new Error('workspace must be a directory');
  return context.run(root,operation);
}
