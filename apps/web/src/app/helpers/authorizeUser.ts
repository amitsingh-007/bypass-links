import {
  type AuthorizationResult,
  checkUserAuthorized,
  getAuthBearer,
  getFirebaseUser,
  verifyAuthToken,
} from '@bypass/trpc/appRouter';
import { type NextRequest } from 'next/server';

type FirebaseUser = Awaited<ReturnType<typeof getFirebaseUser>>;

/** Applies the same rules as the tRPC middleware. */
export const authorizeUser = async (
  request: NextRequest
): Promise<AuthorizationResult> => {
  const idToken = getAuthBearer(request);
  if (!idToken) {
    return {
      ok: false,
      status: 401,
      message: 'Authentication token not found',
    };
  }

  let user: FirebaseUser;
  try {
    const { uid } = await verifyAuthToken(idToken, true);
    user = await getFirebaseUser(uid);
  } catch {
    return { ok: false, status: 401, message: 'Unauthorized user' };
  }

  return checkUserAuthorized(user);
};
