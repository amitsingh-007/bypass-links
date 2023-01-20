import { getEnvVars } from '@/constants/env';
import { type AppRouter } from '@bypass/trpc';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return '';
  }
  const { VERCEL_URL, PORT } = getEnvVars();
  if (VERCEL_URL) {
    return `https://${VERCEL_URL}`;
  }
  return `http://localhost:${PORT ?? 3000}`;
};

export const api = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
});
