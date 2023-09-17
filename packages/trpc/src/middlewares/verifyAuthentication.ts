import { TRPCError } from '@trpc/server';
import { t } from '../trpc';
import { verifyAuthToken } from '../services/firebaseAdminService';

const verifyAuthMiddleware = t.middleware(async (opts) => {
  const { ctx } = opts;
  const { bearerToken } = ctx;
  if (!bearerToken) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication token not found',
    });
  }
  try {
    await verifyAuthToken(bearerToken, true);
  } catch (e) {
    console.error(e);
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Firebase authorization failed',
    });
  }
  return opts.next({ ctx });
});

export default verifyAuthMiddleware;
