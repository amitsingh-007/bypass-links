import { TRPCError } from '@trpc/server';

import { t } from '../trpc';
import { checkUserAuthorized } from '../utils/authorization';

const verifyAuthMiddleware = t.middleware(async (opts) => {
  const { ctx } = opts;

  const result = checkUserAuthorized(ctx.user);
  if (!result.ok) {
    throw new TRPCError({
      code: result.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
      message: result.message,
    });
  }

  return opts.next({
    ctx: { ...ctx, user: result.user }, // For type safety in protected procedures
  });
});

export default verifyAuthMiddleware;
