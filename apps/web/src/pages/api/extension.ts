/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getAssetsByReleaseId, getLatestRelease } from '@logic/github';
import { NextApiRequest, NextApiResponse } from 'next';
import { IExtension } from '@bypass/shared';
//@ts-ignore
import { getVersionFromFileName } from '../../../../../packages/shared/src/utils/extensionFile';

const handler = async (
  _req: NextApiRequest,
  res: NextApiResponse<IExtension>
) => {
  const { data: latestRelease } = await getLatestRelease();
  const { data: assets } = await getAssetsByReleaseId(latestRelease.id);
  const [extension] = assets.filter(
    (asset) => asset.content_type === 'application/zip'
  );
  if (!extension) {
    return res.status(500).end();
  }
  const { browser_download_url, name, updated_at } = extension;
  return res.json({
    extension: browser_download_url,
    version: getVersionFromFileName(name),
    date: updated_at,
  });
};

export default handler;
