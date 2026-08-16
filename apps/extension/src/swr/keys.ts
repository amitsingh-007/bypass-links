import {
  invalidateBookmarkKeys,
  joinIds,
  matchKeyPrefix,
} from '@bypass/shared';
import { mutate } from 'swr';

const LAST_VISITED = 'last-visited';
const QUICK_BOOKMARK = 'quick-bookmark';
const FORUM_PAGE = 'forum-page';

/** Popup-only concepts, so they stay out of the shared key surface. */
export const extSwrKeys = {
  currentTab: 'current-tab',
  historyActive: 'history-active',
  lastVisited: (url?: string) => (url ? [LAST_VISITED, url] : null),
  lastVisitedMap: (urls: string[]) => [LAST_VISITED, 'map', joinIds(urls)],
  quickBookmark: (url?: string) => (url ? [QUICK_BOOKMARK, url] : null),
  forumPage: (url?: string) => (url ? [FORUM_PAGE, url] : null),
} as const;

export const extSwrKeyMatchers = {
  lastVisited: matchKeyPrefix(LAST_VISITED),
  quickBookmark: matchKeyPrefix(QUICK_BOOKMARK),
} as const;

/** A wrapper, so a new extension write path cannot forget to pass matchers. */
export const invalidateExtBookmarkKeys = async () => {
  await Promise.all([
    invalidateBookmarkKeys(),
    mutate(extSwrKeyMatchers.quickBookmark),
  ]);
};
