import { useMediaQuery } from '@mantine/hooks';

/**
 * Viewport width check, not a platform check.
 *
 * The `true` initial value is load-bearing. Mantine defaults to
 * `getInitialValueInEffect: true` and returns `matches || false`, so with no
 * initial value the first render reports "not desktop" everywhere — including
 * the 800px-wide extension popup — making every consumer paint a mobile layout
 * for one frame before correcting. Passing `false` would be a no-op for the
 * same reason; `true` is what makes first paint match steady state on desktop.
 *
 * Deliberately not using `getInitialValueInEffect: false`, which reads
 * window.matchMedia during render and risks a Next.js hydration mismatch.
 */
const useIsMobile = () => !useMediaQuery('(min-width: 768px)', true);

export default useIsMobile;
