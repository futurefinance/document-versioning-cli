import { logInfo } from '../utils';
import { prompt as ask } from 'inquirer';
import { sync } from 'fast-glob';
import { registerPrompt } from 'inquirer';
import * as yargs from 'yargs';
import { statSync } from 'fs';
import writeHistory from '../writeHistory';
// @ts-ignore
registerPrompt('fuzzypath', require('inquirer-fuzzy-path'));

async function askPath(): Promise<string> {
  logInfo('What would you like to extract');
  const { path } = await ask([
    {
      type: 'fuzzypath',
      name: 'path',
      // @ts-ignore
      excludePath: nodePath =>
        nodePath.startsWith('node_modules') || nodePath.startsWith('.git'),
      message: ':folder: Select a path for extracting versions',
      default: './'
    }
  ]);
  return path;
}

export type Params = { path?: string };
export const command = 'extract';
export const desc = 'Extract versions from files in path';
export const builder: { [key: string]: yargs.Options } = {
  path: { type: 'string', required: false, description: 'file/folder path' }
};

export async function handler({ path: _path }: Params) {
  const path = _path || (await askPath());
  logInfo(`Extracting, ${path}!`);
  const stat = statSync(path);

  let glob = `${path}`;
  let files = [glob];

  if (stat.isDirectory()) {
    glob = `${glob}/**/*`;
    files = sync([glob]);
  }

  return Promise.all(files.map(path => writeHistory(path))).then(() => {
    logInfo(`:tada: It worked!`);
  });
}
