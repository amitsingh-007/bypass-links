import { getFirebaseUser, verifyAuthToken } from '@bypass/trpc/appRouter';
import { NextRequest } from 'next/server';

export const authorizeUser = async (request: NextRequest) => {
  const bearerToken = request.headers.get('Authorization');
  const idToken = bearerToken?.split('Bearer ')?.[1];
  if (!idToken) {
    throw new Error('Unauthorized user');
  }
  try {
    const { uid } = await verifyAuthToken(idToken, true);
    return await getFirebaseUser(uid);
  } catch (e) {
    throw new Error('Unauthorized user');
  }
};
