import { getYandexFaviconUrl } from '@bypass/shared';

/**
 * Single source for this app's favicon provider. `DynamicProvider` reads the
 * cache and the cache-warming paths write it, so if they disagree every favicon
 * silently renders the fallback — nothing throws and no request is made.
 */
export const faviconUrl = getYandexFaviconUrl;
