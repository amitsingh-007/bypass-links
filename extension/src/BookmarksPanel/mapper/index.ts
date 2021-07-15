import { ContextBookmark, IBookmarksObj, IFolderMetaData } from "../interfaces";

export const bookmarksMapper: (
  kvp: [string, IFolderMetaData],
  urlList: IBookmarksObj["urlList"],
  folderList: IBookmarksObj["folderList"]
) => any = ([_key, { isDir, hash }], urlList, folderList) => {
  const obj = { isDir } as ContextBookmark;
  if (isDir) {
    const folder = folderList[hash];
    obj.name = atob(folder.name);
  } else {
    const bookmark = urlList[hash];
    obj.url = decodeURIComponent(atob(bookmark.url));
    obj.title = decodeURIComponent(atob(bookmark.title));
    obj.taggedPersons = bookmark.taggedPersons || [];
  }
  return obj;
};
