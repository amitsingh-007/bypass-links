import { appRouter, createTRPCContext } from '@bypass/trpc';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { type NextRequest } from 'next/server';

const handler = (req: NextRequest) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext(req),
    onError: !PROD_ENV
      ? ({ path, error }) => {
          console.error(`tRPC failed on ${path}: ${error}`);
        }
      : undefined,
  });
};
export { handler as GET, handler as POST };
