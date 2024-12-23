import { getVersionFromFileName } from '@bypass/configs/manifest/extensionFile';
import { TRPCError } from '@trpc/server';
import { AsyncReturnType } from 'type-fest';
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
  const extensions = assets.filter(
    (asset) => asset.content_type === 'application/zip'
  );

  let chrome;
  let firefox;

  for (const extension of extensions) {
    if (extension.name.startsWith('chrome-')) {
      chrome = mapExtension(extension, true);
    } else if (extension.name.startsWith('firefox-')) {
      firefox = mapExtension(extension, false);
    }
  }

  if (!chrome || !firefox) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Extensions not found',
    });
  }

  return {
    chrome,
    firefox,
  };
};
