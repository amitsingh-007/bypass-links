import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { IUser } from '../@types/trpc';
import { getEnv } from '../constants/env';
import { EFirebaseDBRef } from '../constants/firebase';
import { User2FAInfo } from '../interfaces/firebase';
import { saveToFirebase } from './firebaseAdminService';
import { fetchUser2FAInfo } from './userService';

authenticator.options = { window: 1 };

const get2FATitle = () =>
  getEnv().VERCEL_ENV === 'development' ? 'Bypass Links - Dev' : 'Bypass Links';

const verify2FAToken = (secret: string, token: string) =>
  authenticator.verify({ token, secret });

const is2FASetup = (user2FAInfo: User2FAInfo) =>
  Boolean(user2FAInfo?.secretKey);

const getQrcodeImageUrl = async (otpAuthUrl: string) =>
  qrcode.toDataURL(otpAuthUrl);

export const is2FAEnabled = (user2FAInfo: User2FAInfo) =>
  is2FASetup(user2FAInfo) && user2FAInfo.is2FAEnabled;

export const setup2FA = async (user: IUser) => {
  const user2FAInfo = await fetchUser2FAInfo(user.uid);
  if (is2FASetup(user2FAInfo)) {
    const { secretKey, otpAuthUrl } = user2FAInfo;
    const decodedOtpAuthUrl = decodeURIComponent(otpAuthUrl);
    return {
      secretKey,
      otpAuthUrl: decodedOtpAuthUrl,
      qrcode: await getQrcodeImageUrl(decodedOtpAuthUrl),
    };
  }

  const secret = authenticator.generateSecret();
  const otpAuthUrl = authenticator.keyuri(
    user.displayName ?? '',
    get2FATitle(),
    secret
  );
  await saveToFirebase({
    ref: EFirebaseDBRef.user2FAInfo,
    uid: user.uid,
    data: {
      secretKey: secret,
      otpAuthUrl: encodeURIComponent(otpAuthUrl),
      is2FAEnabled: false,
    },
  });
  return {
    secretKey: secret,
    otpAuthUrl,
    qrcode: await getQrcodeImageUrl(otpAuthUrl),
  };
};

export const verify2FA = async (totp: string, user: IUser) => {
  const user2FAInfo = await fetchUser2FAInfo(user.uid);
  if (!is2FASetup(user2FAInfo)) {
    return false;
  }
  const { secretKey, otpAuthUrl } = user2FAInfo;
  const isVerified = verify2FAToken(secretKey, totp);
  if (isVerified) {
    await saveToFirebase({
      ref: EFirebaseDBRef.user2FAInfo,
      uid: user.uid,
      data: {
        secretKey,
        otpAuthUrl,
        is2FAEnabled: true,
      },
    });
  }
  return isVerified;
};

export const authenticate2FA = async (totp: string, user: IUser) => {
  const user2FAInfo = await fetchUser2FAInfo(user.uid);
  if (!is2FAEnabled(user2FAInfo)) {
    return false;
  }
  return verify2FAToken(user2FAInfo.secretKey, totp);
};
