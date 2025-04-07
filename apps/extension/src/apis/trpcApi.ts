import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import type { AppRouter } from '@bypass/trpc';
import { createTRPCClient, httpBatchLink, loggerLink } from '@trpc/client';

export const trpcApi = createTRPCClient<AppRouter>({
  links: [
    loggerLink({
      enabled: () => true,
    }),
    httpBatchLink({
      url: `${HOST_NAME}/api/trpc`,
      headers: async () => {
        const { getIdToken } = useFirebaseStore.getState();
        const idToken = await getIdToken();

        return {
          authorization: idToken ? `Bearer ${idToken}` : undefined,
        };
      },
    }),
  ],
});
