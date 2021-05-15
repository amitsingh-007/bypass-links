import { fetchApi } from "GlobalUtils/fetch";

export const setup2FA = async (uid) => {
  const { secretKey, otpAuthUrl } = await fetchApi(
    `/api/auth/setup-2fa/?uid=${uid}`
  );
  return { secretKey, otpAuthUrl };
};

export const verify2FA = async (uid, totp) => {
  const { isVerified } = await fetchApi(
    `/api/auth/verify-2fa/?totp=${totp}&uid=${uid}`
  );
  return { isVerified };
};

export const status2FA = async (uid) => {
  const { is2FAEnabled } = await fetchApi(`/api/auth/status-2fa/?uid=${uid}`);
  return { is2FAEnabled };
};

export const authenticate2FA = async (uid, totp) => {
  const { isVerified } = await fetchApi(
    `/api/auth/authenticate-2fa/?totp=${totp}&uid=${uid}`
  );
  return { isVerified };
};

export const revoke2FA = async (uid) => {
  const { isRevoked } = await fetchApi(`/api/auth/revoke-2fa/?uid=${uid}`);
  return { isRevoked };
};
