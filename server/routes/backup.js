const express = require("express");
const serverless = require("serverless-http");
const bearerToken = require("express-bearer-token");
const { getFromFirebase, saveToFirebase } = require("../utils/firebase");
const { BASE_PATH } = require("../constants");
const setEnvVars = require("../middlewares/setEnvVars");
const { getEnv } = require("../../common/src/utils/env");

const app = express();
const router = express.Router();

app.use(setEnvVars);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bearerToken());
app.use(`${BASE_PATH}/backup`, router);

router.get("/", async (req, res) => {
  const bearerToken = req.token;
  if (bearerToken !== process.env.FIREBASE_BACKUP_CRON_JOB_API_KEY) {
    return res.sendStatus(401).end();
  }
  const env = getEnv();
  const snapshot = await getFromFirebase({ ref: env, isAbsolute: true });
  await saveToFirebase({
    ref: `/backup/${env}`,
    data: snapshot.val(),
    isAbsolute: true,
  });
  res.json({ status: "Firebase backup successful" });
});

module.exports = app;
module.exports.handler = serverless(app);
