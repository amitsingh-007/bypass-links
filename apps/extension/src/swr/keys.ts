import {
  invalidateBookmarkKeys,
  joinIds,
  matchKeyPrefix,
} from '@bypass/shared';
import { mutate } from 'swr';

const LAST_VISITED = 'last-visited';
const QUICK_BOOKMARK = 'quick-bookmark';

/** Popup-only concepts, so they stay out of the shared key surface. */
export const extSwrKeys = {
  currentTab: 'current-tab',
  lastVisited: (url?: string) => (url ? [LAST_VISITED, url] : null),
  lastVisitedMap: (urls: string[]) => [LAST_VISITED, 'map', joinIds(urls)],
  quickBookmark: (url?: string) => (url ? [QUICK_BOOKMARK, url] : null),
} as const;

export const extSwrKeyMatchers = {
  lastVisited: matchKeyPrefix(LAST_VISITED),
  quickBookmark: matchKeyPrefix(QUICK_BOOKMARK),
} as const;

export const invalidateExtBookmarkKeys = async () => {
  await Promise.all([
    invalidateBookmarkKeys(),
    mutate(extSwrKeyMatchers.quickBookmark),
  ]);
};
