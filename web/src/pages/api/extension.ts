import { getAssetsByReleaseId, getLatestRelease } from '@logic/github';
import { NextApiRequest, NextApiResponse } from 'next';
import { getVersionFromFileName } from '@common/utils/extensionFile';

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  const { data: latestRelease } = await getLatestRelease();
  const { data: assets } = await getAssetsByReleaseId(latestRelease.id);
  const [extension] = assets.filter(
    (asset) => asset.content_type === 'application/zip'
  );
  res.json({
    extension: extension && extension.browser_download_url,
    version: extension && getVersionFromFileName(extension.name),
  });
};

export default handler;
