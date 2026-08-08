import { type SWRConfiguration } from 'swr';

/**
 * No cache `provider`: a custom one would be separate from SWR's module-level
 * default and silently break the `mutate` calls made outside React.
 * No global `onError`: only the extension mounts a Toaster, so it layers one
 * on in its own SWRConfig rather than this transport-neutral base carrying a
 * dependency the web app cannot satisfy.
 */
export const swrConfig: SWRConfiguration = {
  // Storage only changes through our own mutations, so refetching is churn
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  errorRetryCount: 2,
};
