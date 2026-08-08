import { type DecodedIdToken } from 'firebase-admin/auth';

import { type IUser } from '../@types/trpc';
import { verifyAuthToken } from '../services/firebaseAdminService';
import { getAuthBearer } from './headers';

export type AuthorizationResult =
  | { ok: true; user: IUser }
  | { ok: false; status: 401 | 403; message: string };

/**
 * `disabled` is safe to hardcode: verifyIdToken(token, checkRevoked) rejects
 * disabled accounts, so a token that verified belongs to an enabled user.
 * `email_verified` is an issuance-time claim, so it lags a live user record
 * until the client refreshes its token.
 */
const mapTokenToUser = (token: DecodedIdToken): IUser => ({
  uid: token.uid,
  email: token.email,
  emailVerified: token.email_verified ?? false,
  displayName: token.name,
  photoURL: token.picture,
  disabled: false,
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
  if (user.disabled) {
    return { ok: false, status: 403, message: 'User is disabled' };
  }
  if (!user.emailVerified) {
    return { ok: false, status: 403, message: 'User email is unverified' };
  }
  // Returning the user lets callers narrow without a non-null assertion
  return { ok: true, user };
};

/**
 * The single token -> authorized user path for every transport. Verification
 * already fetches the user record to check revocation, so the user is built
 * from the decoded token rather than paying a second auth round trip.
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
