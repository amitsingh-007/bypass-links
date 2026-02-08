import { type IBookmarksObj, type ISelectedBookmarks } from '@bypass/shared';
import { bookmarksItem, hasPendingBookmarksItem } from '@/storage/items';

export const isFolderContainsDir = (
  folders: IBookmarksObj['folders'],
  hash: string
) => folders[hash]?.some(({ isDir }) => isDir);

export const getSelectedCount = (selectedBookmarks: ISelectedBookmarks) =>
  selectedBookmarks.filter(Boolean).length;

export const getCutCount = (cutBookmarks: ISelectedBookmarks) =>
  cutBookmarks.filter(Boolean).length;

export const setBookmarksInStorage = async (bookmarksObj: IBookmarksObj) => {
  await bookmarksItem.setValue(bookmarksObj);
  await hasPendingBookmarksItem.setValue(true);
};
