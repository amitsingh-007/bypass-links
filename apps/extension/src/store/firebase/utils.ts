import type {
  IAuthResponse,
  IIdentityAuthResponse,
} from '@/interfaces/firebase';

export const getExpiresAtMs = (expiresIn: number) => {
  return Date.now() + expiresIn * 1000;
};

/**
 * Not in `api.ts`, so the Playwright auth setup can share it: `api.ts` reads
 * `import.meta.env` at module scope, which is undefined in Node.
 */
export const mapAuthResponse = (res: IIdentityAuthResponse): IAuthResponse => ({
  uid: res.localId,
  email: res.email,
  photoUrl: res.photoUrl,
  displayName: res.displayName,
  idToken: res.idToken,
  // The wire format is a string; the helper takes a number
  expiresAtMs: getExpiresAtMs(Number(res.expiresIn)),
  refreshToken: res.refreshToken,
});
