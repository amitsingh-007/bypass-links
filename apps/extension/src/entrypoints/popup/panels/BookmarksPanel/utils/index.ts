import {
  type IBookmarksObj,
  type ISelectedBookmarks,
  STORAGE_KEYS,
} from '@bypass/shared';

export const isFolderContainsDir = (
  folders: IBookmarksObj['folders'],
  hash: string
) => folders[hash]?.some(({ isDir }) => isDir);

export const getSelectedCount = (selectedBookmarks: ISelectedBookmarks) =>
  selectedBookmarks.filter(Boolean).length;

export const getCutCount = (cutBookmarks: ISelectedBookmarks) =>
  cutBookmarks.filter(Boolean).length;

export const setBookmarksInStorage = async (bookmarksObj: IBookmarksObj) => {
  await browser.storage.local.set({
    [STORAGE_KEYS.bookmarks]: bookmarksObj,
    hasPendingBookmarks: true,
  });
};
