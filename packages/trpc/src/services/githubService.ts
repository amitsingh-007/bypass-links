import { Octokit } from '@octokit/rest';
import { REPO } from '../constants/github';
import { env } from '../constants/env';

const octokit = new Octokit({
  auth: env.GITHUB_TOKEN,
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
