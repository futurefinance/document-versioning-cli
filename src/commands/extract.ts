import { logInfo } from '../utils';
import { prompt as ask } from 'inquirer';
import { sync } from 'fast-glob';

import * as yargs from 'yargs'; // eslint-disable-line no-unused-vars

async function askPath(): Promise<string> {
  logInfo(':tada: Which file/folder path would you like to version?');
  const { path } = await ask([
    {
      type: 'input',
      name: 'path',
      message: 'e.g: ./my-documents/contract-one.md'
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
export async function handler({ path }: Params) {
  logInfo(`Extracting, ${path || (await askPath())}!`);
  const files = sync(path);
  console.log(files);
}
