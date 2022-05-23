import {
  Authenticate2FAResponse,
  Revoke2FAResponse,
  Setup2FAResponse,
  Status2FAResponse,
  Verify2FAResponse,
} from '@common/interfaces/twoFactorAuth';
import fetchApi from '@common/utils/fetch';

export const setup2FA = async (uid: string): Promise<Setup2FAResponse> => {
  const { secretKey, otpAuthUrl } = await fetchApi(
    `/api/2fa-auth/setup?uid=${uid}`
  );
  return { secretKey, otpAuthUrl };
};

export const verify2FA = async (
  uid: string,
  totp: string
): Promise<Verify2FAResponse> => {
  const { isVerified } = await fetchApi(
    `/api/2fa-auth/verify?totp=${totp}&uid=${uid}`
  );
  return { isVerified };
};

export const status2FA = async (uid: string): Promise<Status2FAResponse> => {
  try {
    const { is2FAEnabled } = await fetchApi(`/api/2fa-auth/status?uid=${uid}`);
    return { is2FAEnabled };
  } catch (e) {
    console.log('2fa status api failed', e);
    if (__PROD__) {
      throw e;
    } else {
      return { is2FAEnabled: false };
    }
  }
};

export const authenticate2FA = async (
  uid: string,
  totp: string
): Promise<Authenticate2FAResponse> => {
  const { isVerified } = await fetchApi(
    `/api/2fa-auth/authenticate?totp=${totp}&uid=${uid}`
  );
  return { isVerified };
};

export const revoke2FA = async (uid: string): Promise<Revoke2FAResponse> => {
  const { isRevoked } = await fetchApi(`/api/2fa-auth/revoke?uid=${uid}`);
  return { isRevoked };
};
