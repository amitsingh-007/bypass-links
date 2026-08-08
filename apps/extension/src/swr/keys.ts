import { invalidateBookmarkKeys, matchKeyPrefix } from '@bypass/shared';
import { mutate } from 'swr';

const LAST_VISITED = 'last-visited';
const QUICK_BOOKMARK = 'quick-bookmark';

/** Popup-only concepts, so they stay out of the shared key surface. */
export const extSwrKeys = {
  currentTab: 'current-tab',
  lastVisited: (url?: string) => (url ? [LAST_VISITED, url] : null),
  // Shares the LAST_VISITED prefix so one matcher invalidates both shapes
  lastVisitedMap: (urls: string[]) => [LAST_VISITED, 'map', urls.join('|')],
  quickBookmark: (url?: string) => (url ? [QUICK_BOOKMARK, url] : null),
} as const;

export const extSwrKeyMatchers = {
  lastVisited: matchKeyPrefix(LAST_VISITED),
  quickBookmark: matchKeyPrefix(QUICK_BOOKMARK),
} as const;

/**
 * A wrapper rather than an optional argument on the shared invalidator: a new
 * extension write path cannot forget to pass something it never sees.
 */
export const invalidateExtBookmarkKeys = async () => {
  await Promise.all([
    invalidateBookmarkKeys(),
    mutate(extSwrKeyMatchers.quickBookmark),
  ]);
};
