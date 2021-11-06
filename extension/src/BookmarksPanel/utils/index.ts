import { getBookmarks } from "GlobalHelpers/fetchFromStorage";
import { hasText } from "GlobalUtils/search";
import md5 from "md5";
import memoize from "memoize-one";
import {
  ContextBookmarks,
  IBookmark,
  IBookmarksObj,
  ISelectedBookmarks,
} from "../interfaces";

export const getFaviconUrl = (url: string) =>
  `https://s2.googleusercontent.com/s2/favicons?sz=64&domain=${
    new URL(url).hostname
  }`;

export const getAllFolderNames = memoize(
  (folderList: IBookmarksObj["folderList"]) =>
    Object.entries(folderList).map(([_key, value]) => atob(value.name))
);

export const isFolderEmpty = (
  folders: IBookmarksObj["folders"],
  name: string
) => {
  const folder = folders[md5(name)];
  return !folder || folder.length < 1;
};

export const isFolderContainsDir = (
  folders: IBookmarksObj["folders"],
  hash: string
) => folders[hash] && folders[hash].some(({ isDir }) => isDir);

export const shouldRenderBookmarks = (
  folders: IBookmarksObj["folders"],
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
