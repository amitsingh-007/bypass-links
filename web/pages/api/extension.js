import { getAssetsByReleaseId, getLatestRelease } from "@logic/github";

const handler = async (_req, res) => {
  const { data: latestRelease } = await getLatestRelease();
  const { data: assets } = await getAssetsByReleaseId(latestRelease.id);
  const [extension] = assets.filter(
    (asset) => asset.content_type === "application/zip"
  );

  res.json({
    extension: extension && extension.browser_download_url,
  });
};

export default handler;
