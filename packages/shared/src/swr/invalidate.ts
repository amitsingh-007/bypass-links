import { mutate } from 'swr';

import { swrKeyMatchers, swrKeys } from './keys';

/**
 * Global `mutate`: these run outside React, so call after the write lands.
 * The image matcher stays broad to also reach the grid's aggregate entry.
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
