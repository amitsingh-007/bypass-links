import { Octokit } from '@octokit/rest';
import { REPO } from '../constants/github';
import { getEnv } from '../constants/env';

const { GITHUB_TOKEN } = getEnv();

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
