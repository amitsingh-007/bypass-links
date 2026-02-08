import type { AppRouter } from '@bypass/trpc';
import { createTRPCClient, httpBatchLink, loggerLink } from '@trpc/client';
import { env } from '@/constants/env';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';

export const trpcApi = createTRPCClient<AppRouter>({
  links: [
    loggerLink({
      enabled: () => true,
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
