/**
 * Web-app-only routes. Named distinctly from `ROUTES` in @bypass/shared so an
 * auto-import cannot silently swap one for the other.
 */
export const WEB_ROUTES = {
  HOMEPAGE: '/',
  BYPASS_LINKS_WEB: '/web-ext',
} as const;
