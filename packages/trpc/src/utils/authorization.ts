import { type DecodedIdToken } from 'firebase-admin/auth';

import { type IUser } from '../@types/trpc';
import { verifyAuthToken } from '../services/firebaseAdminService';
import { getAuthBearer } from './headers';

export type AuthorizationResult =
  | { ok: true; user: IUser }
  | { ok: false; status: 401 | 403; message: string };

/** `email_verified` is issuance-time, so it lags until the token refreshes. */
const mapTokenToUser = (token: DecodedIdToken): IUser => ({
  uid: token.uid,
  email: token.email,
  emailVerified: token.email_verified ?? false,
  displayName: token.name,
  photoURL: token.picture,
});

/**
 * The single token -> authorized user path, shared so REST routes cannot drift
 * behind the tRPC middleware. Returns a result rather than throwing, since each
 * caller needs its own error type. Verification already fetches the user
 * record, so the user is built from the token, not a second round trip.
 */
export const resolveUserFromRequest = async (
  req: Request
): Promise<AuthorizationResult> => {
  const idToken = getAuthBearer(req);
  if (!idToken) {
    return {
      ok: false,
      status: 401,
      message: 'Authentication token not found',
    };
  }

  let user: IUser;
  try {
    user = mapTokenToUser(await verifyAuthToken(idToken, true));
  } catch (error) {
    console.error(error);
    return { ok: false, status: 401, message: 'Firebase authorization failed' };
  }

  if (!user.emailVerified) {
    return { ok: false, status: 403, message: 'User email is unverified' };
  }
  // Returning the user lets callers narrow without a non-null assertion
  return { ok: true, user };
};
