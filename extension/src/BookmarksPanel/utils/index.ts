import {
  IBookmarksObj,
  ISelectedBookmarks,
} from '@common/components/Bookmarks/interfaces';
import storage from 'GlobalHelpers/chrome/storage';
import { STORAGE_KEYS } from '@common/constants/storage';

export const getAllFolderNames = (folderList: IBookmarksObj['folderList']) =>
  Object.entries(folderList).map(([_key, value]) => atob(value.name));

export const isFolderContainsDir = (
  folders: IBookmarksObj['folders'],
  hash: string
) => folders[hash] && folders[hash].some(({ isDir }) => isDir);

export const getSelectedCount = (selectedBookmarks: ISelectedBookmarks) =>
  selectedBookmarks.filter(Boolean).length;

export const setBookmarksInStorage = async (bookmarksObj: IBookmarksObj) => {
  await storage.set({
    [STORAGE_KEYS.bookmarks]: bookmarksObj,
    hasPendingBookmarks: true,
  });
};
