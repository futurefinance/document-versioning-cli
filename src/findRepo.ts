import { resolve } from 'path';
import { pathExists } from 'fs-extra';

export default async function findRepo(
  _dirPath: string = './'
): Promise<string | null> {
  const dirPath = resolve(_dirPath);
  const existsDir = await pathExists(dirPath);
  const existsRepo = await pathExists(resolve(dirPath, '.git'));
  if (existsDir === false || dirPath === '/') {
    return null;
  } else if (existsRepo === true) {
    return dirPath;
  }
  return findRepo(resolve(dirPath, '..'));
}
