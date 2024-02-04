import { TRPCError, initTRPC } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import requestIp from 'request-ip';
import { ITRPCContext } from './@types/trpc';
import {
  getFirebaseUser,
  verifyAuthToken,
} from './services/firebaseAdminService';

const getLoggedInUser = async (idToken: string | undefined) => {
  if (!idToken) {
    return null;
  }
  try {
    const { uid } = await verifyAuthToken(idToken, true);
    return await getFirebaseUser(uid);
  } catch (e) {
    console.error(e);
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Firebase authorization failed',
    });
  }
};

export const createTRPCContext = async (
  opts: CreateNextContextOptions
): Promise<ITRPCContext> => {
  const { req } = opts;
  const { headers } = req;
  const ip = requestIp.getClientIp(req);
  const userAgent = headers['user-agent'];
  const bearerToken = headers.authorization?.split?.('Bearer ')?.[1];
  const user = await getLoggedInUser(bearerToken);

  return {
    reqMetaData: {
      ip,
      userAgent,
    },
    user,
  };
};

export const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    errorFormatter({ shape }) {
      return shape;
    },
  });
