import storage from "ChromeApi/storage";
import { STORAGE_KEYS } from "GlobalConstants/";
import { fetchApi } from "GlobalUtils/fetch";

export const setup2FA = async () => {
  // const { [STORAGE_KEYS.userProfile]: userProfile } = await storage.get(
  //   STORAGE_KEYS.userProfile
  // );
  // await fetchApi(`/api/auth/setup-2fa/?uid=${userProfile.uid}`);
  return {
    otpAuthUrl:
      "otpauth://totp/SecretKey?secret=IVKHMNTSLBDX2S33LNJEG5BGKQVHSKKTKZLT4323GZKCMNCBKQ4Q",
    secretKey: "IVKHMNTSLBDX2S33LNJEG5BGKQVHSKKTKZLT4323GZKCMNCBKQ4Q",
  };
};

export const verify2FA = async (uid, totp) => {
  // await fetchApi(`/api/auth/verify-2fa/?totp=${totp}&uid=${uid}`);
  return { isVerified: true };
};

export const status2FA = async (uid) => {
  // await fetchApi(`/api/auth/status-2fa/?uid=${uid}`);
  return { is2FAEnabled: false };
};

export const authenticate2FA = async (uid, totp) => {
  // await fetchApi(`/api/auth/authenticate-2fa/?totp=${totp}&uid=${uid}`);
  return { isVerified: true };
};
