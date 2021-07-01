import fetchApi from "@bypass-links/common/src/utils/fetch";

export const setup2FA = async (uid) => {
  const { secretKey, otpAuthUrl } = await fetchApi(
    `/api/2fa-auth/setup/?uid=${uid}`
  );
  return { secretKey, otpAuthUrl };
};

export const verify2FA = async (uid, totp) => {
  const { isVerified } = await fetchApi(
    `/api/2fa-auth/verify/?totp=${totp}&uid=${uid}`
  );
  return { isVerified };
};

export const status2FA = async (uid) => {
  try {
    const { is2FAEnabled } = await fetchApi(`/api/2fa-auth/status/?uid=${uid}`);
    return { is2FAEnabled };
  } catch (e) {
    console.log("2fa status api failed", e);
    if (__PROD__) {
      throw e;
    } else {
      return { is2FAEnabled: false };
    }
  }
};

export const authenticate2FA = async (uid, totp) => {
  const { isVerified } = await fetchApi(
    `/api/2fa-auth/authenticate/?totp=${totp}&uid=${uid}`
  );
  return { isVerified };
};

export const revoke2FA = async (uid) => {
  const { isRevoked } = await fetchApi(`/api/2fa-auth/revoke/?uid=${uid}`);
  return { isRevoked };
};
