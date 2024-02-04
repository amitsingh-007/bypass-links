import { TRPCError } from '@trpc/server';
import { t } from '../trpc';

const verifyAuthMiddleware = t.middleware(async (opts) => {
  const { ctx } = opts;
  const { user } = ctx;
  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication token not found',
    });
  }
  if (user.disabled) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'User is disabled',
    });
  }
  if (!user.emailVerified) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'User email is unverified',
    });
  }

  return opts.next({
    ctx: { ...ctx, user }, // for type safety in protected procedures
  });
});

export default verifyAuthMiddleware;
