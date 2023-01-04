import { appRouter, createTRPCContext } from '@bypass/trpc';
import { createNextApiHandler } from '@trpc/server/adapters/next';

export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError: !__PROD__
    ? ({ path, error }) => {
        console.error(`tRPC failed on ${path}: ${error}`);
      }
    : undefined,
});
