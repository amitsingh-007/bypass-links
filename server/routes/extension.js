const express = require("express");
const serverless = require("serverless-http");
const { BASE_PATH } = require("../constants");
const { getLatestRelease, getAssetsByReleaseId } = require("../utils/github");

const app = express();
const router = express.Router();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(`${BASE_PATH}/extension`, router);

router.get("/", async (_req, res) => {
  const { data: latestRelease } = await getLatestRelease();
  const { data: assets } = await getAssetsByReleaseId(latestRelease.id);
  const extension = assets.filter(
    (asset) => asset.content_type === "application/zip"
  )[0];

  res.json({
    extension: extension && extension.browser_download_url,
  });
});

module.exports = app;
module.exports.handler = serverless(app);
