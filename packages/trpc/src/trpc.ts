import { TRPCError, initTRPC } from '@trpc/server';

import { type ITRPCContext } from './@types/trpc';
import { resolveRequestUser } from './utils/authorization';

export const createTRPCContext = async (
  req: Request
): Promise<ITRPCContext> => {
  const resolved = await resolveRequestUser(req);
  if (resolved.ok) {
    return { user: resolved.user };
  }
  if (resolved.reason === 'invalid') {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Firebase authorization failed',
    });
  }
  // Missing token: let checkUserAuthorized produce the 401
  return { user: null };
};

export const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    errorFormatter({ shape }) {
      return shape;
    },
  });
