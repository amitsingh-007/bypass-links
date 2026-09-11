import { type IBookmarksObj } from '@bypass/shared';

import { bookmarksItem, hasPendingBookmarksItem } from '@/storage/items';
import { invalidateExtBookmarkKeys } from '@/swr/keys';

export const isFolderContainsDir = (
  folders: IBookmarksObj['folders'],
  hash: string
) => folders[hash]?.some(({ isDir }) => isDir);

export const setBookmarksInStorage = async (bookmarksObj: IBookmarksObj) => {
  await Promise.all([
    bookmarksItem.setValue(bookmarksObj),
    hasPendingBookmarksItem.setValue(true),
  ]);
  await invalidateExtBookmarkKeys();
};
