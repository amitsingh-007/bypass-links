import { initTRPC } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import requestIp from 'request-ip';

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req } = opts;
  const { headers } = req;
  const ip = requestIp.getClientIp(req);
  const userAgent = headers['user-agent'];
  return {
    reqMetaData: {
      ip,
      userAgent,
    },
  };
};

export const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    errorFormatter({ shape }) {
      return shape;
    },
  });
