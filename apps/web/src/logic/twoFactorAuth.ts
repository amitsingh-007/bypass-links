import { FIREBASE_DB_REF, Setup2FAResponse } from '@bypass/shared';
import { authenticator } from 'otplib';
import { User2FAInfo } from '../interfaces/twoFactorAuth';
import { getFromFirebase, getUser, saveToFirebase } from './firebase';
import { get2FATitle } from './index';

authenticator.options = { window: 1 };

const verify2FAToken = (secret: string, token: string) =>
  authenticator.verify({ token, secret });

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
  const user = await getUser(uid);
  const secret = authenticator.generateSecret();
  const otpAuthUrl = authenticator.keyuri(
    user.displayName ?? '',
    get2FATitle(),
    secret
  );
  await saveToFirebase({
    ref: FIREBASE_DB_REF.user2FAInfo,
    uid,
    data: {
      secretKey: secret,
      otpAuthUrl: encodeURIComponent(otpAuthUrl),
      is2FAEnabled: false,
    },
  });
  return { secretKey: secret, otpAuthUrl };
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
  return verify2FAToken(user2FAInfo.secretKey, totp);
};
