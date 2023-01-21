import { REPO } from '../constants/github';
import { Octokit } from '@octokit/rest';
import { getEnvVars } from '../constants/env';

const { GITHUB_TOKEN } = getEnvVars();

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

export const getLatestRelease = async () =>
  await octokit.rest.repos.getLatestRelease({
    owner: REPO.OWNER,
    repo: REPO.NAME,
  });

export const getAssetsByReleaseId = async (releaseId: number) =>
  await octokit.rest.repos.listReleaseAssets({
    owner: REPO.OWNER,
    repo: REPO.NAME,
    release_id: releaseId,
  });
