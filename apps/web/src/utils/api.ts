import { type AppRouter } from '@bypass/trpc';
import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client';
import { serverEnv } from '@/constants/env/server.mjs';
import { getAuthIdToken } from '@/ui/firebase/auth';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return '';
  }
  if (serverEnv.VERCEL_URL) {
    return `https://${serverEnv.VERCEL_URL}`;
  }
  return `http://localhost:${serverEnv.PORT ?? 3000}`;
};

export const api = createTRPCProxyClient<AppRouter>({
  links: [
    loggerLink({
      enabled: (opts) =>
        (serverEnv.VERCEL_ENV === 'development' &&
          typeof window !== 'undefined') ||
        (opts.direction === 'down' && opts.result instanceof Error),
    }),
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers: async () => ({
        authorization: `Bearer ${await getAuthIdToken()}`,
      }),
    }),
  ],
});
