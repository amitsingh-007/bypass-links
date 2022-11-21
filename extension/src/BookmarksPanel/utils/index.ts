import { getBookmarks } from 'GlobalHelpers/fetchFromStorage';
import memoize from 'memoize-one';
import {
  IBookmarksObj,
  ISelectedBookmarks,
} from '@common/components/Bookmarks/interfaces';

export const getAllFolderNames = memoize(
  (folderList: IBookmarksObj['folderList']) =>
    Object.entries(folderList).map(([_key, value]) => atob(value.name))
);

export const isFolderContainsDir = (
  folders: IBookmarksObj['folders'],
  hash: string
) => folders[hash] && folders[hash].some(({ isDir }) => isDir);

export const getSelectedCount = memoize(
  (selectedBookmarks: ISelectedBookmarks) =>
    selectedBookmarks.filter(Boolean).length
);
