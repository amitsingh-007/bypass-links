import { getBookmarks } from 'GlobalHelpers/fetchFromStorage';
import { hasText } from 'GlobalUtils/search';
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

export const shouldRenderBookmarks = (
  folders: IBookmarksObj['folders'],
  contextBookmarks: ContextBookmarks
) => folders && contextBookmarks && contextBookmarks.length > 0;

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

export const getFilteredContextBookmarks = memoize(
  (contextBookmarks: ContextBookmarks, searchText: string) =>
    contextBookmarks?.filter(
      ({ url, title, name }) =>
        !searchText ||
        hasText(searchText, url) ||
        hasText(searchText, title) ||
        hasText(searchText, name)
    )
);

export const getSelectedCount = memoize(
  (selectedBookmarks: ISelectedBookmarks) =>
    selectedBookmarks.filter(Boolean).length
);
