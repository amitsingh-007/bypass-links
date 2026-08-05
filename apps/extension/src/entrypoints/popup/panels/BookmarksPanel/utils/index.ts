import { type IBookmarksObj, type ISelectedBookmarks } from '@bypass/shared';

import { bookmarksItem, hasPendingBookmarksItem } from '@/storage/items';

export const isFolderContainsDir = (
  folders: IBookmarksObj['folders'],
  hash: string
) => folders[hash]?.some(({ isDir }) => isDir);

export const countTruthy = (bookmarks: ISelectedBookmarks) =>
  bookmarks.filter(Boolean).length;

export const setBookmarksInStorage = async (bookmarksObj: IBookmarksObj) => {
  await Promise.all([
    bookmarksItem.setValue(bookmarksObj),
    hasPendingBookmarksItem.setValue(true),
  ]);
};
