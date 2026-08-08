// Consts, so the key factories and the matchers below cannot drift apart
const PERSON_IMAGE = 'person-image';
const TAGGED_BOOKMARKS = 'tagged-bookmarks';
const LAST_VISITED = 'last-visited';
const QUICK_BOOKMARK = 'quick-bookmark';

/** Sorted and deduped, so a re-sorted list is the same key. */
export const joinIds = (ids: string[]) =>
  [...new Set(ids)].toSorted().join('|');

/**
 * Single keys are plain strings, not thunks: SWR's global `mutate` treats a
 * function as a key *filter*, so a dropped `()` would wipe the whole cache.
 */
export const swrKeys = {
  personsWithImages: 'persons-with-images',
  persons: 'persons',
  bookmarks: 'bookmarks',
  defaultFolderUrls: 'default-folder-urls',
  redirections: 'redirections',
  currentTab: 'current-tab',
  personImage: (uid?: string) => (uid ? [PERSON_IMAGE, uid] : null),
  // Shares the prefix above so one matcher invalidates both shapes
  personImageMap: (uids: string[]) => [PERSON_IMAGE, 'map', joinIds(uids)],
  taggedBookmarks: (uid?: string) => (uid ? [TAGGED_BOOKMARKS, uid] : null),
  lastVisited: (url?: string) => (url ? [LAST_VISITED, url] : null),
  lastVisitedMap: (urls: string[]) => [LAST_VISITED, 'map', joinIds(urls)],
  quickBookmark: (url?: string) => (url ? [QUICK_BOOKMARK, url] : null),
} as const;

const matchKeyPrefix = (prefix: string) => (key: unknown) =>
  Array.isArray(key) && key[0] === prefix;

export const swrKeyMatchers = {
  personImage: matchKeyPrefix(PERSON_IMAGE),
  taggedBookmarks: matchKeyPrefix(TAGGED_BOOKMARKS),
  lastVisited: matchKeyPrefix(LAST_VISITED),
  quickBookmark: matchKeyPrefix(QUICK_BOOKMARK),
} as const;
