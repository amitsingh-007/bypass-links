import { matchesText } from '../../../utils/search';
import { ROOT_FOLDER_ID, ROOT_FOLDER_NAME } from '../constants';
import {
  type ContextBookmarks,
  type IEncodedBookmark,
  type IBookmarksObj,
  type IEncodedFolder,
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
  contextBookmarks.filter(
    (ctx) => ctx.isDir || matchesText(searchText, ctx.url, ctx.title)
  );

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
  Object.values(folderList).map(getDecryptedFolder);

export const getDefaultFolder = (folders: IEncodedFolder[]) =>
  folders.find((x) => x.isDefault);

export const getDefaultFolderUrls = ({
  folderList,
  folders,
  urlList,
}: IBookmarksObj) => {
  const parentHash =
    getDefaultFolder(Object.values(folderList))?.id ?? ROOT_FOLDER_ID;

  return Object.values(folders[parentHash] ?? [])
    .filter((bookmark) => !bookmark.isDir)
    .map((urlData) => urlList[urlData.hash]);
};

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
