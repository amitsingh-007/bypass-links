import { appRouter, createTRPCContext } from '@bypass/trpc';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { type NextRequest } from 'next/server';

const handler = async (req: NextRequest) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => createTRPCContext(req),
    onError:
      process.env.NEXT_PUBLIC_PROD_ENV === 'true'
        ? undefined
        : ({ path, error }) => {
            console.error(`tRPC failed on ${path}: ${error}`);
          },
  });
};
export { handler as GET, handler as POST };
