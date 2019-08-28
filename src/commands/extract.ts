import { logInfo } from '../utils';
import { prompt as ask } from 'inquirer';
import { sync } from 'fast-glob';
import { registerPrompt } from 'inquirer';
import * as yargs from 'yargs';
import { statSync } from 'fs';
import findRepo from '../findRepo';
import writeHistory from '../writeHistory';
// @ts-ignore
registerPrompt('fuzzypath', require('inquirer-fuzzy-path'));

async function askSrc(): Promise<string> {
  logInfo('Which path (file or folder) would you like to version?');
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

async function askDest(): Promise<string> {
  logInfo(
    "Which destination folder would you like to use for your versioned documents? (it doesn't have to exist)"
  );
  const { dest } = await ask([
    {
      type: 'input',
      name: 'dest',
      message: ':folder: Select a path for your output',
      default: './'
    }
  ]);
  return dest;
}

export type Params = { path?: string; dest?: string };
export const command = 'extract';
export const desc = 'Extract versions from files in path';
export const builder: { [key: string]: yargs.Options } = {
  path: {
    type: 'string',
    required: false,
    description: 'source file/folder path for versioning'
  },
  dest: {
    type: 'string',
    required: false,
    description: 'dest folder for version output'
  }
};

export async function handler({ path: _path, dest: _dest }: Params) {
  const repo = await findRepo();
  if (!repo) {
    throw new Error('This cli can only be used inside a git repository');
  }
  const path = _path || (await askSrc());
  const dest = _dest || (await askDest());
  const stat = statSync(path);

  let glob = `${path}`;
  let files = [glob];

  if (stat.isDirectory()) {
    glob = `${glob}/**/*`;
    files = sync([glob]);
  }

  return Promise.all(
    files.map(path => {
      logInfo(`Extracting versions for file "${path}"!`);
      return writeHistory(path, repo, dest);
    })
  ).then(() => {
    logInfo(`:tada: Extracted all versions from path: "${path}"!`);
  });
}
