import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@bypass/trpc';
import { getAuthIdToken } from '@/helpers/firebase/auth';

export const api = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${HOST_NAME}/api/trpc`,
      headers: async () => ({
        authorization: `Bearer ${await getAuthIdToken()}`,
      }),
    }),
  ],
});
