import { type AppRouter } from '@bypass/trpc';
import { createTRPCClient, httpBatchLink } from '@trpc/client';

import { getAuthIdToken } from '@app/helpers/firebase/auth';

export const api = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      headers: async () => ({
        authorization: `Bearer ${await getAuthIdToken()}`,
      }),
    }),
  ],
});
