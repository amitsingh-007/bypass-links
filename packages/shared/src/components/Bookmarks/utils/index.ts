import { hasText } from '../../../utils/search';
import { ROOT_FOLDER_ID, ROOT_FOLDER_NAME } from '../constants';
import {
  type ContextBookmark,
  type ContextBookmarks,
  type IEncodedBookmark,
  type IBookmarksObj,
  type IEncodedFolder,
  type IFolderMetaData,
} from '../interfaces';

export const isFolderEmpty = (
  folders: IBookmarksObj['folders'],
  folderId: string
) => {
  const folder = folders[folderId];
  return !folder || folder.length === 0;
};

// Provider is a param, not from DynamicContext: callers here are not components
export const getBookmarkFaviconUrls = (
  urlList: IBookmarksObj['urlList'],
  getFaviconUrl: (url: string) => string
) =>
  Object.values(urlList).map((item) =>
    getFaviconUrl(getDecryptedBookmark(item).url)
  );

export const getFilteredContextBookmarks = (
  contextBookmarks: ContextBookmarks,
  searchText: string
) =>
  contextBookmarks.filter((ctx) => {
    if (!searchText) {
      return true;
    }
    if (ctx.isDir) {
      return true;
    }
    return hasText(searchText, ctx.url) || hasText(searchText, ctx.title);
  });

export const encodeBookmarkField = (value: string) =>
  btoa(encodeURIComponent(value));

export const getEncryptedBookmark = (
  bookmark: IEncodedBookmark
): IEncodedBookmark => ({
  ...bookmark,
  url: encodeBookmarkField(bookmark.url),
  title: encodeBookmarkField(bookmark.title),
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

export const getFolderName = (
  folderList: IBookmarksObj['folderList'],
  folderId: string
) => {
  if (folderId === ROOT_FOLDER_ID) {
    return ROOT_FOLDER_NAME;
  }
  const folder = folderList[folderId];
  return folder ? getDecryptedFolder(folder).name : 'Not Found';
};

export const bookmarksMapper = (
  { isDir, hash }: IFolderMetaData,
  urlList: IBookmarksObj['urlList'],
  folderList: IBookmarksObj['folderList']
): ContextBookmark => {
  if (isDir) {
    const folder = getDecryptedFolder(folderList[hash]);
    return {
      id: folder.id,
      isDir,
      name: folder.name,
      isDefault: Boolean(folder.isDefault),
    };
  }

  const bookmark = getDecryptedBookmark(urlList[hash]);
  return {
    id: bookmark.id,
    isDir,
    url: bookmark.url,
    title: bookmark.title,
    taggedPersons: bookmark.taggedPersons,
  };
};
