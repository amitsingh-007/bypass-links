import { type IUser } from '../@types/trpc';

export type AuthorizationResult =
  | { ok: true }
  | { ok: false; status: 401 | 403; message: string };

/**
 * The authorization rules, shared so REST routes cannot drift behind the tRPC
 * middleware. Returns a result rather than throwing: tRPC needs a TRPCError and
 * the Next route needs a NextResponse, so each caller maps this to its own
 * error type. Throwing a shared error here would surface as a 500 from tRPC
 * context creation.
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
  return { ok: true };
};
