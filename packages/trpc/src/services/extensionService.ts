import { getAssetsByReleaseId, getLatestRelease } from './githubService';

export const getLatestExtension = async () => {
  const { data: latestRelease } = await getLatestRelease();
  const { data: assets } = await getAssetsByReleaseId(latestRelease.id);
  const [extension] = assets.filter(
    (asset) => asset.content_type === 'application/zip'
  );
  return extension;
};
