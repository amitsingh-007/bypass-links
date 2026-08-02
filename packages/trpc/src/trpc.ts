import { TRPCError, initTRPC } from '@trpc/server';

import { type ITRPCContext } from './@types/trpc';
import {
  getFirebaseUser,
  verifyAuthToken,
} from './services/firebaseAdminService';
import { getAuthBearer } from './utils/headers';

const getLoggedInUser = async (idToken: string | undefined) => {
  if (!idToken) {
    return null;
  }
  try {
    const { uid } = await verifyAuthToken(idToken, true);
    return await getFirebaseUser(uid);
  } catch (error) {
    console.error(error);
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Firebase authorization failed',
    });
  }
};

export const createTRPCContext = async (
  req: Request
): Promise<ITRPCContext> => {
  const user = await getLoggedInUser(getAuthBearer(req));

  return { user };
};

export const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    errorFormatter({ shape }) {
      return shape;
    },
  });
