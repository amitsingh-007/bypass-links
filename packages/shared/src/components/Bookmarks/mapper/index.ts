import {
  ContextBookmark,
  IBookmark,
  IBookmarksObj,
  IFolderMetaData,
} from '../interfaces';

export const getDecryptedBookmark = (bookmark: IBookmark): IBookmark => ({
  url: decodeURIComponent(atob(bookmark.url)),
  title: decodeURIComponent(atob(bookmark.title)),
  taggedPersons: bookmark.taggedPersons || [],
  parentHash: bookmark.parentHash,
});

export const getEncryptedBookmark = (bookmark: IBookmark): IBookmark => ({
  url: btoa(encodeURIComponent(bookmark.url)),
  title: btoa(encodeURIComponent(bookmark.title)),
  taggedPersons: bookmark.taggedPersons || [],
  parentHash: bookmark.parentHash,
});

export const bookmarksMapper: (
  kvp: [string, IFolderMetaData],
  urlList: IBookmarksObj['urlList'],
  folderList: IBookmarksObj['folderList']
) => any = ([_key, { isDir, hash }], urlList, folderList) => {
  const obj = { isDir } as ContextBookmark;
  if (isDir) {
    const folder = folderList[hash];
    obj.name = atob(folder.name);
  } else {
    const bookmark = getDecryptedBookmark(urlList[hash]);
    obj.url = bookmark.url;
    obj.title = bookmark.title;
    obj.taggedPersons = bookmark.taggedPersons;
  }
  return obj;
};
