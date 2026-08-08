import { getGoogleFaviconUrl } from '@bypass/shared';

/**
 * One provider per app. The favicon cache is keyed by the generated url, so
 * changing the provider in some call sites but not others turns every cached
 * favicon into a permanent miss.
 */
export const getFaviconUrl = getGoogleFaviconUrl;
