import { mutate } from 'swr';

import { swrKeyMatchers, swrKeys } from './keys';

/** Call after the write lands. The image matcher also covers the grid's map key. */
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
