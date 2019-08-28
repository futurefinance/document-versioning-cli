import { Repository } from 'nodegit';
import { resolve, extname, basename } from 'path';
import { pathExistsSync, outputFile } from 'fs-extra';

export default async function writeFileHistory(
  filePath: string,
  repoPath: string,
  _outputDir: string
) {
  if (!pathExistsSync(filePath)) {
    throw new Error(`"${filePath}" does not exist`);
  }

  const extName = extname(filePath);
  const outputDir = resolve(_outputDir, basename(filePath, extName));

  return Repository.open(repoPath).then(async function read(repo) {
    const walker = repo.createRevWalk();
    const headCommit = await repo.getHeadCommit();
    walker.push(headCommit.id());

    const commits = await walker.fileHistoryWalk(filePath, 30000);
    return Promise.all(
      commits.map(async function({ commit }) {
        commit.repo = repo;
        try {
          const entry = await commit.getEntry(filePath);
          const blob = await entry.getBlob();
          return outputFile(
            resolve(outputDir, `${commit.id()}.${extName}`),
            blob
          );
        } catch (err) {
          console.log(err);
        }
      })
    );
  });
}
