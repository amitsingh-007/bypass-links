import {
  ContextBookmark,
  IEncodedBookmark,
  IBookmarksObj,
  IFolderMetaData,
} from '../interfaces';
import { getDecodedFolder } from '../utils/url';

export const getDecryptedBookmark = (
  bookmark: IEncodedBookmark
): IEncodedBookmark => ({
  url: decodeURIComponent(atob(bookmark.url)),
  title: decodeURIComponent(atob(bookmark.title)),
  taggedPersons: bookmark.taggedPersons || [],
  parentHash: bookmark.parentHash,
});

export const getEncryptedBookmark = (
  bookmark: IEncodedBookmark
): IEncodedBookmark => ({
  url: btoa(encodeURIComponent(bookmark.url)),
  title: btoa(encodeURIComponent(bookmark.title)),
  taggedPersons: bookmark.taggedPersons || [],
  parentHash: bookmark.parentHash,
});

export const bookmarksMapper = (
  [_key, { isDir, hash }]: [string, IFolderMetaData],
  urlList: IBookmarksObj['urlList'],
  folderList: IBookmarksObj['folderList']
): ContextBookmark => {
  if (isDir) {
    const folder = folderList[hash];
    return getDecodedFolder(folder);
  }
  const bookmark = getDecryptedBookmark(urlList[hash]);
  return {
    isDir,
    url: bookmark.url,
    title: bookmark.title,
    taggedPersons: bookmark.taggedPersons,
  };
};
