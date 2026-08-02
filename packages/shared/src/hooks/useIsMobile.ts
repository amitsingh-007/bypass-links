import { useMediaQuery } from '@mantine/hooks';

/**
 * The `true` initial value is load-bearing: Mantine returns `matches || false`
 * before its effect runs, so without it every first paint reports mobile.
 * Passing `false` is a no-op for the same reason.
 */
const useIsMobile = () => !useMediaQuery('(min-width: 768px)', true);

export default useIsMobile;
