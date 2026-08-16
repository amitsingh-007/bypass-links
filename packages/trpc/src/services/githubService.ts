import { REPO } from '@bypass/shared';
import { Octokit } from '@octokit/rest';

import { env } from '../constants/env';

const octokit = new Octokit({
  auth: env.GITHUB_TOKEN,
});

/** The response already embeds `assets`, so no second call is needed. */
export const getLatestRelease = async () =>
  octokit.rest.repos.getLatestRelease({
    owner: REPO.OWNER,
    repo: REPO.NAME,
  });
