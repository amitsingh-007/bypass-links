import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@bypass/trpc';

export const api = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${HOST_NAME}/api/trpc`,
    }),
  ],
});
