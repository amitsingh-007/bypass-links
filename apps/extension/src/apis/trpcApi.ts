import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client';
import type { AppRouter } from '@bypass/trpc';
import { getAuthIdToken } from '@/helpers/firebase/auth';

export const trpcApi = createTRPCProxyClient<AppRouter>({
  links: [
    loggerLink({
      enabled: () => true,
    }),
    httpBatchLink({
      url: `${HOST_NAME}/api/trpc`,
      headers: async () => ({
        authorization: `Bearer ${await getAuthIdToken()}`,
      }),
    }),
  ],
});
