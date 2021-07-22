import { Setup2FAResponse } from "@common/interfaces/twoFactorAuth";
import {
  createUser2FA,
  fetchUser2FA,
  saveVerifiedUser,
} from "@database/authenticate";
import speakeasy from "speakeasy";
import { User2FAInfo } from "../interfaces/twoFactorAuth";
import { get2FATitle } from "./index";

const verify2FAToken = (secretKey: string, totp: string, window = 0) =>
  speakeasy.totp.verify({
    secret: secretKey,
    token: totp,
    encoding: "base32",
    window,
  });

const is2FASetup = (user2FAInfo: User2FAInfo) => user2FAInfo.secretKey;

export const is2FAEnabled = (user2FAInfo: User2FAInfo) =>
  is2FASetup(user2FAInfo) && user2FAInfo.is2FAEnabled;

export const setup2FA = async (uid: string): Promise<Setup2FAResponse> => {
  const user2FAInfo = await fetchUser2FA(uid);
  if (user2FAInfo && is2FASetup(user2FAInfo)) {
    const { secretKey, otpAuthUrl } = user2FAInfo;
    return { secretKey, otpAuthUrl };
  }
  const { base32, otpauth_url = "" } = speakeasy.generateSecret({
    name: get2FATitle(),
    symbols: false,
  });
  await createUser2FA(uid, {
    secretKey: base32,
    otpAuthUrl: otpauth_url,
    is2FAEnabled: false,
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
  const user2FAInfo = await fetchUser2FA(uid);
  if (!user2FAInfo || !is2FASetup(user2FAInfo)) {
    return false;
  }
  const { secretKey } = user2FAInfo;
  const isVerified = verify2FAToken(secretKey, totp);
  if (isVerified) {
    await saveVerifiedUser(uid);
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
  const user2FAInfo = await fetchUser2FA(uid);
  if (!user2FAInfo || !is2FAEnabled(user2FAInfo)) {
    return false;
  }
  return verify2FAToken(user2FAInfo.secretKey, totp, 1);
};
