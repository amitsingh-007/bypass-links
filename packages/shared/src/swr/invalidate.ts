import { mutate } from 'swr';

import { swrKeyMatchers, swrKeys } from './keys';

/**
 * Global `mutate`: these run outside React. Call after the write lands, or the
 * revalidation refetches pre-write data.
 *
 * The image matcher is deliberately broad. It has to reach the grid's single
 * aggregate `[PERSON_IMAGE, 'map', ...]` entry as well as any per-person one:
 * narrowing to `personImage(uid)` would leave every grid avatar stale after an
 * edit, since the uid set — and so the map key — does not change.
 *
 * Narrowing used to matter when each cell held its own entry. Batching the
 * grid onto one entry removed that cost.
 */
export const invalidatePersonKeys = async () => {
  await Promise.all([
    mutate(swrKeys.persons),
    mutate(swrKeys.personsWithImages),
    mutate(swrKeyMatchers.personImage),
  ]);
};

export const invalidateBookmarkKeys = async () => {
  await Promise.all([
    mutate(swrKeys.bookmarks),
    mutate(swrKeyMatchers.quickBookmark),
    mutate(swrKeys.defaultFolderUrls),
    mutate(swrKeyMatchers.taggedBookmarks),
  ]);
};

/** For login/logout, which swap every storage item at once. */
export const invalidateAllKeys = async () => {
  await mutate(() => true);
};
