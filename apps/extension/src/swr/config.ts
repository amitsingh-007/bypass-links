import { swrConfig } from '@bypass/shared';
import { toast } from 'sonner';
import { type SWRConfiguration } from 'swr';

const FALLBACK_MESSAGE = 'Something went wrong';

/**
 * Adapter, not `toast.error` itself: SWR calls onError(error, key, config),
 * and toast.error reads its second argument as options, so the SWR key would
 * be interpreted as toast config.
 *
 * Server messages are not surfaced verbatim; a fetch failure should not put
 * backend wording in front of a user.
 */
const notifyError = (error: unknown) => {
  console.error(error);
  toast.error(FALLBACK_MESSAGE);
};

/**
 * The extension is the only app that mounts a Toaster, which is why the
 * shared config leaves onError out. This is the intended override point:
 * without it a query added without its own onError fails silently.
 *
 * Covers useSWR only. useSWRMutation takes its own onError.
 */
export const extSwrConfig: SWRConfiguration = {
  ...swrConfig,
  onError: notifyError,
};
