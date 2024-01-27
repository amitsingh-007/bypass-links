import { getVersionFromFileName } from '@bypass/configs/manifest/extensionFile';
import { TRPCError } from '@trpc/server';
import { getAssetsByReleaseId, getLatestRelease } from './githubService';

export const getLatestExtension = async () => {
  const { data: latestRelease } = await getLatestRelease();
  const { data: assets } = await getAssetsByReleaseId(latestRelease.id);
  const [extension] = assets.filter(
    (asset) => asset.content_type === 'application/zip'
  );

  if (!extension) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Extension not found',
    });
  }

  return {
    extension: extension.browser_download_url,
    version: getVersionFromFileName(extension.name),
    date: extension.updated_at,
  };
};
