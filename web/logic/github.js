import { REPO } from "@constants/index";
import { Octokit } from "@octokit/rest";

const authToken = process.env.GITHUB_TOKEN;

const octokit = new Octokit({
  auth: authToken,
});

export const getLatestRelease = async () =>
  await octokit.rest.repos.getLatestRelease({
    owner: REPO.OWNER,
    repo: REPO.NAME,
  });

export const getAssetsByReleaseId = async (releaseId) =>
  await octokit.rest.repos.listReleaseAssets({
    owner: REPO.OWNER,
    repo: REPO.NAME,
    release_id: releaseId,
  });
