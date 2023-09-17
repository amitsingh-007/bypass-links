import { initTRPC } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import requestIp from 'request-ip';
import { ITRPCContext } from './@types/trpc';

export const createTRPCContext = async (
  opts: CreateNextContextOptions
): Promise<ITRPCContext> => {
  const { req } = opts;
  const { headers } = req;
  const ip = requestIp.getClientIp(req);
  const userAgent = headers['user-agent'];
  const bearerToken = headers.authorization?.split?.('Bearer ')?.[1];
  return {
    reqMetaData: {
      ip,
      userAgent,
    },
    bearerToken,
  };
};

export const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    errorFormatter({ shape }) {
      return shape;
    },
  });
