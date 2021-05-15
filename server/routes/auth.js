const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const { BASE_PATH, ALLOWED_ORIGIN } = require("../constants");
const { removeFromFirebase } = require("../utils/firebase");
const {
  FIREBASE_DB_REF,
} = require("@bypass-links/common/src/constants/firebase");
const setEnvVars = require("../middlewares/setEnvVars");
const verifyUserId = require("../middlewares/verifyUserId");
const {
  is2FAEnabled,
  fetchUser2FAInfo,
  setup2FA,
  verify2FA,
  authenticate2FA,
} = require("../logic/TwoFactorAuth");

const app = express();
const router = express.Router();

app.use(setEnvVars);
if (global.__PROD__) {
  app.use(cors({ origin: ALLOWED_ORIGIN }));
}
app.use(verifyUserId);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(`${BASE_PATH}/auth`, router);

/**
 * API to initalize 2FA of a user for the very first time
 */
router.get("/setup-2fa", async (req, res) => {
  const { uid } = req.query;
  const { secretKey, otpAuthUrl } = await setup2FA(uid);
  res.json({ secretKey, otpAuthUrl });
});

/**
 * API to verify the user while setting up 2FA
 */
router.get("/verify-2fa", async (req, res) => {
  const { uid, totp } = req.query;
  const isVerified = await verify2FA({ uid, totp });
  await res.json({ isVerified });
});

/**
 * API to authenticate the user when he tries to login
 */
router.get("/authenticate-2fa", async (req, res) => {
  const { uid, totp } = req.query;
  const isVerified = await authenticate2FA({ uid, totp });
  res.json({ isVerified });
});

/**
 * API which indicates whether 2FA is enabled by the user or not
 */
router.get("/status-2fa", async (req, res) => {
  const { uid } = req.query;
  const user2FAInfo = await fetchUser2FAInfo(uid);
  res.json({ is2FAEnabled: is2FAEnabled(user2FAInfo) });
});

/**
 * API to revoke 2FA of the given user
 */
router.get("/revoke-2fa", async (req, res) => {
  const { uid } = req.query;
  await removeFromFirebase({
    ref: `${FIREBASE_DB_REF.userInfo}/twoFactorAuth/`,
    uid,
  });
  res.json({ isRevoked: true });
});

module.exports = app;
module.exports.handler = serverless(app);
