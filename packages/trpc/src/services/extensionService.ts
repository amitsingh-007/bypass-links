import { getVersionFromFileName } from '@bypass/configs/manifest/extensionFile';
import { TRPCError } from '@trpc/server';
import { cacheLife, cacheTag } from 'next/cache';
import { type AsyncReturnType } from 'type-fest';

import { getAssetsByReleaseId, getLatestRelease } from './githubService';

const ONE_DAY_IN_SEC = 24 * 60 * 60;
const ONE_MONTH_IN_SEC = 30 * ONE_DAY_IN_SEC;
const ONE_YEAR_IN_SEC = 365 * ONE_DAY_IN_SEC;

type TGitHubResponse = AsyncReturnType<typeof getAssetsByReleaseId>['data'];
type TGitHubAsset = TGitHubResponse[number];

const mapExtension = (extension: TGitHubAsset) => ({
  downloadLink: extension.browser_download_url,
  version: getVersionFromFileName(extension.name),
  date: extension.updated_at,
});

/**
 * Invalidated by the Purge Vercel Cache step in the release workflow. `expire`
 * only has to outlast `revalidate`, which Next requires.
 */
export const getLatestExtension = async () => {
  'use cache';
  cacheTag('extensions-release-cache');
  cacheLife({ revalidate: ONE_MONTH_IN_SEC, expire: ONE_YEAR_IN_SEC });

  const { data: latestRelease } = await getLatestRelease();
  const { data: assets } = await getAssetsByReleaseId(latestRelease.id);

  const chromeAsset = assets.find(
    (asset) => asset.content_type === 'application/zip'
  );

  if (!chromeAsset) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Extension not found',
    });
  }

  return {
    chrome: mapExtension(chromeAsset),
  };
};
