import { type IUser } from '../@types/trpc';

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
