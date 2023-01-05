import { appRouter } from '../src/index';
import { createInnerTRPCContext } from '../src/trpc';

export const getTrpcCaller = async () => {
  const ctx = await createInnerTRPCContext({});
  return appRouter.createCaller(ctx);
};
