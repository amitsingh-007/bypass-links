import {
  Authenticate2FAResponse,
  Status2FAResponse,
} from '../../../interfaces/twoFactorAuth';
import { fetchApi } from '../../../utils/fetch';

export const authenticate2FA = async (
  uid: string,
  totp: string
): Promise<Authenticate2FAResponse> => {
  const { isVerified } = await fetchApi(
    `/api/2fa-auth/authenticate?totp=${totp}&uid=${uid}`
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
