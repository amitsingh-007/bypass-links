import type {
  IAuthResponse,
  IIdentityAuthResponse,
} from '@/interfaces/firebase';

export const getExpiresAtMs = (expiresIn: string | number) => {
  return Date.now() + Number(expiresIn) * 1000;
};

/**
 * Kept in this module (not `api.ts`) so the Playwright auth setup can share it:
 * `api.ts` reads `import.meta.env` at module scope, which is undefined in Node.
 */
export const mapAuthResponse = (res: IIdentityAuthResponse): IAuthResponse => ({
  uid: res.localId,
  email: res.email,
  photoUrl: res.photoUrl,
  displayName: res.displayName,
  idToken: res.idToken,
  expiresAtMs: getExpiresAtMs(res.expiresIn),
  refreshToken: res.refreshToken,
});
