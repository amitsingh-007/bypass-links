import { useMediaQuery } from '@mantine/hooks';

/**
 * The `true` initial value is load-bearing: Mantine returns `matches || false`
 * before its effect runs, so every first paint would report mobile.
 */
const useIsMobile = () => !useMediaQuery('(min-width: 768px)', true);

export default useIsMobile;
