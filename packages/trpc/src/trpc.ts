import { initTRPC } from '@trpc/server';

import { type ITRPCContext } from './@types/trpc';
import { resolveUserFromRequest } from './utils/authorization';

export const createTRPCContext = async (
  req: Request
): Promise<ITRPCContext> => {
  const auth = await resolveUserFromRequest(req);

  return { auth };
};

export const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create();
