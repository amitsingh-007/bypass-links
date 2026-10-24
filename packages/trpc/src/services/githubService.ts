import { REPO } from '@bypass/shared/server';
import { Octokit } from '@octokit/rest';

import { getGithubToken } from '../constants/env';

let octokit: Octokit | undefined;

const getOctokit = () => (octokit ??= new Octokit({ auth: getGithubToken() }));

export const getLatestRelease = async () =>
  getOctokit().rest.repos.getLatestRelease({
    owner: REPO.OWNER,
    repo: REPO.NAME,
  });

export const getAssetsByReleaseId = async (releaseId: number) =>
  getOctokit().rest.repos.listReleaseAssets({
    owner: REPO.OWNER,
    repo: REPO.NAME,
    release_id: releaseId,
  });
