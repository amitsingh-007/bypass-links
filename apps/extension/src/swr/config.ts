import { swrConfig } from '@bypass/shared';
import { toast } from 'sonner';
import { type SWRConfiguration } from 'swr';

// Adapter, not toast.error itself: SWR passes (error, key, config), and
// toast.error would read the key as options
const notifyError = (error: unknown) => {
  console.error(error);
  toast.error('Something went wrong');
};

/** Covers useSWR only; useSWRMutation takes its own onError. */
export const extSwrConfig: SWRConfiguration = {
  ...swrConfig,
  onError: notifyError,
};
