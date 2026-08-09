import { TRPCError } from '@trpc/server';

import { t } from '../trpc';

const verifyAuthMiddleware = t.middleware(async (opts) => {
  const { ctx } = opts;

  if (!ctx.auth.ok) {
    throw new TRPCError({
      code: ctx.auth.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
      message: ctx.auth.message,
    });
  }

  return opts.next({
    ctx: { ...ctx, user: ctx.auth.user }, // For type safety in protected procedures
  });
});

export default verifyAuthMiddleware;
