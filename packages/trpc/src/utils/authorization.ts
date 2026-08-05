import { type IUser } from '../@types/trpc';
import {
  getFirebaseUser,
  verifyAuthToken,
} from '../services/firebaseAdminService';
import { getAuthBearer } from './headers';

export type ResolvedRequestUser =
  | { ok: true; user: IUser }
  | { ok: false; reason: 'missing' | 'invalid' };

/**
 * Single place that turns a request into a user. Shared so the tRPC context and
 * the REST helper cannot drift on token verification.
 *
 * Keeps 'missing' and 'invalid' distinct: a missing token yields a 401 via
 * `checkUserAuthorized(null)`, while an invalid one is an explicit UNAUTHORIZED
 * error in the tRPC context. Collapsing both to null would change the
 * client-visible error for bad tokens.
 */
export const resolveRequestUser = async (
  req: Request
): Promise<ResolvedRequestUser> => {
  const idToken = getAuthBearer(req);
  if (!idToken) {
    return { ok: false, reason: 'missing' };
  }
  try {
    const { uid } = await verifyAuthToken(idToken, true);
    return { ok: true, user: await getFirebaseUser(uid) };
  } catch (error) {
    // The only server-side trace of an auth failure
    console.error(error);
    return { ok: false, reason: 'invalid' };
  }
};

export type AuthorizationResult =
  | { ok: true; user: IUser }
  | { ok: false; status: 401 | 403; message: string };

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
