import type { AppRouter } from '@bypass/trpc';
import { createTRPCClient, httpBatchLink, loggerLink } from '@trpc/client';

import { env, IS_PROD } from '@/constants/env';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';

export const trpcApi = createTRPCClient<AppRouter>({
  links: [
    loggerLink({
      enabled(opts) {
        if (!IS_PROD) {
          return true;
        }
        return opts.direction === 'down' && opts.result instanceof Error;
      },
    }),
    httpBatchLink({
      url: `${env.NEXT_PUBLIC_HOST_NAME}/api/trpc`,
      async headers() {
        const { getIdToken } = useFirebaseStore.getState();
        const idToken = await getIdToken();

        return {
          authorization: idToken ? `Bearer ${idToken}` : undefined,
        };
      },
    }),
  ],
});
