import {
  type AuthorizationResult,
  checkUserAuthorized,
  resolveRequestUser,
} from '@bypass/trpc/appRouter';
import { type NextRequest } from 'next/server';

/** Applies the same rules as the tRPC middleware. */
export const authorizeUser = async (
  request: NextRequest
): Promise<AuthorizationResult> => {
  const resolved = await resolveRequestUser(request);
  if (!resolved.ok) {
    return resolved.reason === 'missing'
      ? checkUserAuthorized(null)
      : { ok: false, status: 401, message: 'Unauthorized user' };
  }
  return checkUserAuthorized(resolved.user);
};
