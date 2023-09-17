import { type AppRouter } from '@bypass/trpc';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
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
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers: async () => ({
        authorization: `Bearer ${await getAuthIdToken()}`,
      }),
    }),
  ],
});
