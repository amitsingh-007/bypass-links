import { initTRPC } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';

type CreateContextOptions = Record<string, never>;

export const createInnerTRPCContext = async (_opts: CreateContextOptions) => {
  return {};
};

export const createTRPCContext = async (_opts: CreateNextContextOptions) => {
  return await createInnerTRPCContext({});
};

export const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    errorFormatter({ shape }) {
      return shape;
    },
  });
