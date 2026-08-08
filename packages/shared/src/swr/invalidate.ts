import { mutate } from 'swr';

import { swrKeyMatchers, swrKeys } from './keys';

/**
 * Global `mutate`: these run outside React. Call after the write lands, or the
 * revalidation refetches pre-write data.
 *
 * `uid` narrows to one avatar; without it every mounted one re-reads the map.
 */
export const invalidatePersonKeys = async (uid?: string) => {
  await Promise.all([
    mutate(swrKeys.persons),
    mutate(swrKeys.personsWithImages),
    mutate(uid ? swrKeys.personImage(uid) : swrKeyMatchers.personImage),
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
