import { type DecodedIdToken } from 'firebase-admin/auth';

import { type IUser } from '../@types/trpc';
import { verifyAuthToken } from '../services/firebaseAdminService';
import { getAuthBearer } from './headers';

export type AuthorizationResult =
  | { ok: true; user: IUser }
  | { ok: false; status: 401 | 403; message: string };

/**
 * `email_verified` is issuance-time, so it lags until the token refreshes.
 */
const mapTokenToUser = (token: DecodedIdToken): IUser => ({
  uid: token.uid,
  email: token.email,
  emailVerified: token.email_verified ?? false,
  displayName: token.name,
  photoURL: token.picture,
});

/**
 * Shared so REST routes cannot drift behind the tRPC middleware. Returns a
 * result rather than throwing, since each caller needs its own error type.
 */
export const checkUserAuthorized = (
  user: IUser | null
): AuthorizationResult => {
  if (!user) {
    return {
      ok: false,
      status: 401,
      message: 'Authentication token not found',
    };
  }
  if (!user.emailVerified) {
    return { ok: false, status: 403, message: 'User email is unverified' };
  }
  // Returning the user lets callers narrow without a non-null assertion
  return { ok: true, user };
};

/**
 * The single token -> authorized user path. Verification already fetches the
 * user record, so the user is built from the token, not a second round trip.
 */
export const resolveUserFromRequest = async (
  req: Request
): Promise<AuthorizationResult> => {
  const idToken = getAuthBearer(req);
  if (!idToken) {
    return checkUserAuthorized(null);
  }

  let user: IUser;
  try {
    user = mapTokenToUser(await verifyAuthToken(idToken, true));
  } catch (error) {
    console.error(error);
    return { ok: false, status: 401, message: 'Firebase authorization failed' };
  }

  return checkUserAuthorized(user);
};
