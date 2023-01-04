import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@bypass/trpc';
import superjson from 'superjson';

export const api = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${HOST_NAME}/api/trpc`,
    }),
  ],
});
