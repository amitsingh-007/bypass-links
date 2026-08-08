import { type SWRConfiguration } from 'swr';

/**
 * No cache `provider`: it would break the `mutate` calls made outside React.
 * No global `onError`: only the extension mounts a Toaster, so it adds one.
 */
export const swrConfig: SWRConfiguration = {
  // Storage only changes through our own mutations, so refetching is churn
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  errorRetryCount: 2,
};
