import { initTRPC, TRPCError } from '@trpc/server';

import { resolveUserFromRequest } from './utils/authorization';

export const createTRPCContext = async (req: Request) => {
  const auth = await resolveUserFromRequest(req);

  return { auth };
};

export const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create();

export const protectedProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;

  if (!ctx.auth.ok) {
    throw new TRPCError({
      code: ctx.auth.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
      message: ctx.auth.message,
    });
  }

  return opts.next({
    ctx: { ...ctx, user: ctx.auth.user },
  });
});
