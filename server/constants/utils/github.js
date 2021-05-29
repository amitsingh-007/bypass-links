const { Octokit } = require("@octokit/rest");
const { REPO } = require("../constants");

const authToken = process.env.GITHUB_TOKEN;

const octokit = new Octokit({
  auth: authToken,
});

const getLatestRelease = async () =>
  await octokit.rest.repos.getLatestRelease({
    owner: REPO.OWNER,
    repo: REPO.NAME,
  });

const getAssetsByReleaseId = async (releaseId) =>
  await octokit.rest.repos.listReleaseAssets({
    owner: REPO.OWNER,
    repo: REPO.NAME,
    release_id: releaseId,
  });

module.exports = {
  getLatestRelease,
  getAssetsByReleaseId,
};
