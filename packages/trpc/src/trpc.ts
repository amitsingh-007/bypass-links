import { initTRPC } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import superjson from 'superjson';

type CreateContextOptions = Record<string, never>;

const createInnerTRPCContext = async (_opts: CreateContextOptions) => {
  return {};
};

export const createTRPCContext = async (_opts: CreateNextContextOptions) => {
  return await createInnerTRPCContext({});
};

export const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    transformer: superjson,
    errorFormatter({ shape }) {
      return shape;
    },
  });
