import { serverEnv } from '@app/constants/env/server.mjs';
import { getAuthIdToken } from '@app/helpers/firebase/auth';
import { type AppRouter } from '@bypass/trpc';
import { createTRPCClient, httpBatchLink, loggerLink } from '@trpc/client';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return '';
  }
  if (serverEnv.VERCEL_URL) {
    return `https://${serverEnv.VERCEL_URL}`;
  }
  return `http://localhost:${serverEnv.PORT ?? 3000}`;
};

export const api = createTRPCClient<AppRouter>({
  links: [
    loggerLink({
      enabled(opts) {
        if (!PROD_ENV) {
          return true;
        }
        return opts.direction === 'down' && opts.result instanceof Error;
      },
    }),
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers: async () => ({
        authorization: `Bearer ${await getAuthIdToken()}`,
      }),
    }),
  ],
});
