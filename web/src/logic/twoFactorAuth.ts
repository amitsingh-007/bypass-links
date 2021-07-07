import speakeasy from "speakeasy";
import { FIREBASE_DB_REF } from "@common/constants/firebase";
import { Setup2FAResponse, User2FAInfo } from "../interfaces/twoFactorAuth";
import { getFromFirebase, saveToFirebase } from "./firebase";
import { get2FATitle } from "./index";

const verify2FAToken = (secretKey: string, totp: string, window = 0) =>
  speakeasy.totp.verify({
    secret: secretKey,
    token: totp,
    encoding: "base32",
    window,
  });

const is2FASetup = (user2FAInfo: User2FAInfo) =>
  Boolean(user2FAInfo && user2FAInfo.secretKey);

export const is2FAEnabled = (user2FAInfo: User2FAInfo) =>
  is2FASetup(user2FAInfo) && user2FAInfo.is2FAEnabled;

export const fetchUser2FAInfo = async (uid: string): Promise<User2FAInfo> => {
  const response = await getFromFirebase({
    ref: FIREBASE_DB_REF.user2FAInfo,
    uid,
  });
  return response.val();
};

export const setup2FA = async (uid: string): Promise<Setup2FAResponse> => {
  const user2FAInfo = await fetchUser2FAInfo(uid);
  if (is2FASetup(user2FAInfo)) {
    const { secretKey, otpAuthUrl } = user2FAInfo;
    return {
      secretKey,
      otpAuthUrl: decodeURIComponent(otpAuthUrl),
    };
  }
  const { base32, otpauth_url = "" } = speakeasy.generateSecret({
    name: get2FATitle(),
    symbols: false,
  });
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

export const verify2FA = async ({
  uid,
  totp,
}: {
  uid: string;
  totp: string;
}): Promise<boolean> => {
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

export const authenticate2FA = async ({
  uid,
  totp,
}: {
  uid: string;
  totp: string;
}): Promise<boolean> => {
  const user2FAInfo = await fetchUser2FAInfo(uid);
  if (!is2FAEnabled(user2FAInfo)) {
    return false;
  }
  return verify2FAToken(user2FAInfo.secretKey, totp, 1);
};
