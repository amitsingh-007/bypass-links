import {
  Revoke2FAResponse,
  Setup2FAResponse,
  Verify2FAResponse,
} from '@bypass/shared/interfaces/twoFactorAuth';
import fetchApi from '@bypass/shared/utils/fetch';

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

export const revoke2FA = async (uid: string): Promise<Revoke2FAResponse> => {
  const { isRevoked } = await fetchApi(`/api/2fa-auth/revoke?uid=${uid}`);
  return { isRevoked };
};
