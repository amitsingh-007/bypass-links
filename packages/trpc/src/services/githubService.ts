import { Octokit } from '@octokit/rest';
import { getEnvVars } from '../constants/env';
import { REPO } from '../constants/github';

const { GITHUB_TOKEN } = getEnvVars();

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

export const getLatestRelease = async () =>
  octokit.rest.repos.getLatestRelease({
    owner: REPO.OWNER,
    repo: REPO.NAME,
  });

export const getAssetsByReleaseId = async (releaseId: number) =>
  octokit.rest.repos.listReleaseAssets({
    owner: REPO.OWNER,
    repo: REPO.NAME,
    release_id: releaseId,
  });
