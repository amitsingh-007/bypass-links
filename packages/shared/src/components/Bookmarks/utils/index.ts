import { encodeText, decodeText } from '../../../utils/codec';
import { matchesSearch } from '../../../utils/search';
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
  Object.values(urlList).map((item) => getFaviconUrl(decodeBookmark(item).url));

// Folders always survive a search, so their contents stay reachable
export const getFilteredContextBookmarks = (
  contextBookmarks: ContextBookmarks,
  searchText: string
) =>
  contextBookmarks.filter(
    (ctx) => ctx.isDir || matchesSearch(searchText, ctx.url, ctx.title)
  );

export const encodeBookmark = (
  bookmark: IEncodedBookmark
): IEncodedBookmark => ({
  ...bookmark,
  url: encodeText(bookmark.url),
  title: encodeText(bookmark.title),
});

export const decodeBookmark = (
  bookmark: IEncodedBookmark
): IEncodedBookmark => ({
  ...bookmark,
  url: decodeText(bookmark.url),
  title: decodeText(bookmark.title),
});

export const encodeFolder = (folder: IEncodedFolder): IEncodedFolder => ({
  ...folder,
  name: encodeText(folder.name),
});

export const decodeFolder = (folder: IEncodedFolder): IEncodedFolder => ({
  ...folder,
  name: decodeText(folder.name),
});

export const getDecodedFolderList = (folderList: IBookmarksObj['folderList']) =>
  Object.entries(folderList).map(([_key, value]) => decodeFolder(value));

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
  return folder ? decodeFolder(folder).name : 'Not Found';
};

export const bookmarksMapper = (
  { isDir, hash }: IFolderMetaData,
  urlList: IBookmarksObj['urlList'],
  folderList: IBookmarksObj['folderList']
): ContextBookmark => {
  if (isDir) {
    const folder = decodeFolder(folderList[hash]);
    return {
      id: folder.id,
      isDir,
      name: folder.name,
      isDefault: Boolean(folder.isDefault),
    };
  }

  const bookmark = decodeBookmark(urlList[hash]);
  return {
    id: bookmark.id,
    isDir,
    url: bookmark.url,
    title: bookmark.title,
    taggedPersons: bookmark.taggedPersons,
  };
};
