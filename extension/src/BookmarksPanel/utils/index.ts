import { getBookmarks } from "GlobalHelpers/fetchFromStorage";
import md5 from "md5";
import { BM_COUNT_IN_INITAL_VIEW } from "../constants";
import { ContextBookmarks, IBookmark, IBookmarksObj } from "../interfaces";

export const getFaviconUrl = (url: string) =>
  `https://www.google.com/s2/favicons?sz=64&domain_url=${
    new URL(url).hostname
  }`;

export const getAllFolderNames = (folderList: IBookmarksObj["folderList"]) =>
  Object.entries(folderList).map(([_key, value]) => atob(value.name));

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

export const isInInitalView = (position: number) =>
  position < BM_COUNT_IN_INITAL_VIEW;

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
