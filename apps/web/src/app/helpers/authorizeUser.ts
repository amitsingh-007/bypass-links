import {
  checkUserAuthorized,
  getAuthBearer,
  getFirebaseUser,
  verifyAuthToken,
} from '@bypass/trpc/appRouter';
import { type NextRequest } from 'next/server';

type FirebaseUser = Awaited<ReturnType<typeof getFirebaseUser>>;

type AuthorizeUserResult =
  | { ok: true; user: FirebaseUser }
  | { ok: false; status: 401 | 403; message: string };

/** Applies the same rules as the tRPC middleware. */
export const authorizeUser = async (
  request: NextRequest
): Promise<AuthorizeUserResult> => {
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

  const result = checkUserAuthorized(user);
  return result.ok ? { ok: true, user } : result;
};
