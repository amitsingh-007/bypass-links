import { TRPCError, initTRPC } from '@trpc/server';
import { ITRPCContext } from './@types/trpc';
import {
  getFirebaseUser,
  verifyAuthToken,
} from './services/firebaseAdminService';
import { getAuthBearer, getIpAddress } from './utils/headers';

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
  req: Request
): Promise<ITRPCContext> => {
  const { headers } = req;
  const ip = getIpAddress(req);
  const userAgent = headers.get('user-agent');
  const bearerToken = getAuthBearer(req);
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
