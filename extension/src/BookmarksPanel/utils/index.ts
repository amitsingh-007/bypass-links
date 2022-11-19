import { getBookmarks } from 'GlobalHelpers/fetchFromStorage';
import memoize from 'memoize-one';
import {
  ContextBookmarks,
  IBookmark,
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

export const getFolderFromHash = async (hash: string) => {
  const bookmarks = await getBookmarks();
  return bookmarks.folderList[hash];
};

export const getBookmarkFromHash = async (hash: string) => {
  const bookmarks = await getBookmarks();
  return bookmarks.urlList[hash];
};

export const getDecodedBookmark = (bookmark: IBookmark) => ({
  url: decodeURIComponent(atob(bookmark.url)),
  title: decodeURIComponent(atob(bookmark.title)),
  parentHash: bookmark.parentHash,
  taggedPersons: bookmark.taggedPersons,
});

export const getSelectedCount = memoize(
  (selectedBookmarks: ISelectedBookmarks) =>
    selectedBookmarks.filter(Boolean).length
);
