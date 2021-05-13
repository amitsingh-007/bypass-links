const {
  FIREBASE_DB_REF,
} = require("@bypass-links/common/src/constants/firebase");
const { getFromFirebase, saveToFirebase } = require("../utils/firebase");
const speakeasy = require("speakeasy");

const verify2FAToken = (secretKey, totp) =>
  speakeasy.totp.verify({
    secret: secretKey,
    token: totp,
    encoding: "base32",
  });

const is2FASetup = (user2FAInfo) =>
  Boolean(user2FAInfo && user2FAInfo.secretKey);

const is2FAEnabled = (user2FAInfo) =>
  is2FASetup(user2FAInfo) && user2FAInfo.is2FAEnabled;

const fetchUser2FAInfo = async (uid) => {
  const response = await getFromFirebase({
    ref: FIREBASE_DB_REF.user2FAInfo,
    uid,
  });
  return response.val();
};

const setup2FA = async (uid) => {
  const user2FAInfo = await fetchUser2FAInfo(uid);
  if (is2FASetup(user2FAInfo)) {
    const { secretKey, otpAuthUrl } = user2FAInfo;
    return {
      secretKey,
      otpAuthUrl: decodeURIComponent(otpAuthUrl),
    };
  }
  const { base32, otpauth_url } = speakeasy.generateSecret();
  await saveToFirebase({
    ref: FIREBASE_DB_REF.user2FAInfo,
    uid,
    data: {
      secretKey: base32,
      otpAuthUrl: encodeURIComponent(otpauth_url),
      is2FAEnabled: false,
    },
  });
  return { secretKey: base32, otpAuthUrl: otpauth_url };
};

const verify2FA = async ({ uid, totp }) => {
  const user2FAInfo = await fetchUser2FAInfo(uid);
  if (!is2FASetup(user2FAInfo)) {
    return false;
  }
  const { secretKey, otpAuthUrl } = user2FAInfo;
  const isVerified = verify2FAToken(secretKey, totp);
  if (isVerified) {
    await saveToFirebase({
      ref: FIREBASE_DB_REF.user2FAInfo,
      uid,
      data: {
        secretKey,
        otpAuthUrl,
        is2FAEnabled: true,
      },
    });
  }
  return isVerified;
};

const authenticate2FA = async ({ uid, totp }) => {
  const user2FAInfo = await fetchUser2FAInfo(uid);
  if (!is2FAEnabled(user2FAInfo)) {
    return false;
  }
  const isVerified = verify2FAToken(user2FAInfo.secretKey, totp);
  return isVerified;
};

module.exports = {
  is2FAEnabled,
  fetchUser2FAInfo,
  setup2FA,
  verify2FA,
  authenticate2FA,
};
