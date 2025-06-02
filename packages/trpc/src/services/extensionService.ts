import { getVersionFromFileName } from '@bypass/configs/manifest/extensionFile';
import { TRPCError } from '@trpc/server';
import { type AsyncReturnType } from 'type-fest';
import { getAssetsByReleaseId, getLatestRelease } from './githubService';

type TGitHubResponse = AsyncReturnType<typeof getAssetsByReleaseId>['data'];
type TGitHubAsset = TGitHubResponse[number];

const mapExtension = (extension: TGitHubAsset, isChrome: boolean) => ({
  downloadLink: extension.browser_download_url,
  version: getVersionFromFileName(extension.name, isChrome),
  date: extension.updated_at,
});

export const getLatestExtension = async () => {
  const { data: latestRelease } = await getLatestRelease();
  const { data: assets = [] } = await getAssetsByReleaseId(latestRelease.id);

  const chromeAsset = assets.find(
    (asset) => asset.content_type === 'application/zip'
  );
  const firefoxAsset = assets.find(
    (asset) => asset.content_type === 'application/x-xpinstall'
  );

  if (!chromeAsset || !firefoxAsset) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Extensions not found',
    });
  }

  return {
    chrome: mapExtension(chromeAsset, true),
    firefox: mapExtension(firefoxAsset, false),
  };
};
