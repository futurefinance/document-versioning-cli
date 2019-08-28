const NodeGit = require("nodegit");
const path = require('path')
const fs = require('fs-extra')

const defaultRepoPath = process.cwd()
const defaultOutputDir = path.resolve(process.cwd(), 'versions')

async function writeFileHistory(filePath, repoPath = defaultRepoPath, _outputDir = defaultOutputDir) {
  if(!fs.pathExistsSync(filePath)) {
    throw new Error(`"${filePath}" does not exist`)
  }

  const extName = path.extname(filePath)
  const outputDir = path.resolve(_outputDir, path.basename(filePath, extName))

  return NodeGit.Repository.open(repoPath).then(async function read(repo) {
    const walker = repo.createRevWalk()
    const headCommit = await repo.getHeadCommit();
    walker.push(headCommit.id());

    const commits = await walker.fileHistoryWalk(filePath, 30000);
    return Promise.all(commits.map(async function ({ commit }) {
      commit.repo = repo
      try {
        const entry = await commit.getEntry(filePath)
        const blob = await entry.getBlob()
        return fs.outputFile(path.resolve(outputDir, `${commit.id()}.${extName}`), blob)
      } catch(err) {
        console.log(err);
      }
    }))
  });
}

writeFileHistory('test-documents/hello-world.md')