import md5 from 'md5';
import { hasText } from '../../../utils/search';
import {
  ContextBookmarks,
  IEncodedBookmark,
  IBookmarksObj,
  IEncodedFolder,
} from '../interfaces';

export const isFolderEmpty = (
  folders: IBookmarksObj['folders'],
  name: string
) => {
  const folder = folders[md5(name)];
  return !folder || folder.length === 0;
};

export const getFilteredContextBookmarks = (
  contextBookmarks: ContextBookmarks,
  searchText: string
) =>
  contextBookmarks?.filter((ctx) => {
    if (!searchText) {
      return true;
    }
    if (ctx.isDir) {
      return true;
    }
    return hasText(searchText, ctx.url) || hasText(searchText, ctx.title);
  });

export const shouldRenderBookmarks = (
  folders: IBookmarksObj['folders'],
  contextBookmarks: ContextBookmarks
) => folders && contextBookmarks && contextBookmarks.length > 0;

export const getEncryptedBookmark = (
  bookmark: IEncodedBookmark
): IEncodedBookmark => ({
  ...bookmark,
  url: btoa(encodeURIComponent(bookmark.url)),
  title: btoa(encodeURIComponent(bookmark.title)),
});

export const getDecryptedBookmark = (
  bookmark: IEncodedBookmark
): IEncodedBookmark => ({
  ...bookmark,
  url: decodeURIComponent(atob(bookmark.url)),
  title: decodeURIComponent(atob(bookmark.title)),
});

export const getEncryptedFolder = (folder: IEncodedFolder): IEncodedFolder => ({
  ...folder,
  name: btoa(folder.name),
});

export const getDecryptedFolder = (folder: IEncodedFolder): IEncodedFolder => ({
  ...folder,
  name: atob(folder.name),
});

export const getDecodedFolderList = (folderList: IBookmarksObj['folderList']) =>
  Object.entries(folderList).map(([_key, value]) => getDecryptedFolder(value));

export const getDefaultFolder = (folders: IEncodedFolder[]) =>
  folders.find((x) => x.isDefault);
