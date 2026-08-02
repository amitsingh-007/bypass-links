import {
  checkUserAuthorized,
  getAuthBearer,
  getFirebaseUser,
  verifyAuthToken,
} from '@bypass/trpc/appRouter';
import { type NextRequest, NextResponse } from 'next/server';

export class UnauthorizedError extends Error {
  constructor(
    readonly status: 401 | 403,
    message: string
  ) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/** Applies the same rules as the tRPC middleware. */
export const authorizeUser = async (request: NextRequest) => {
  const idToken = getAuthBearer(request);
  if (!idToken) {
    throw new UnauthorizedError(401, 'Authentication token not found');
  }

  let user;
  try {
    const { uid } = await verifyAuthToken(idToken, true);
    user = await getFirebaseUser(uid);
  } catch {
    throw new UnauthorizedError(401, 'Unauthorized user');
  }

  const result = checkUserAuthorized(user);
  if (!result.ok) {
    throw new UnauthorizedError(result.status, result.message);
  }
  return user;
};

export const toAuthErrorResponse = (error: unknown) => {
  if (error instanceof UnauthorizedError) {
    return new NextResponse(error.message, { status: error.status });
  }
  throw error;
};
