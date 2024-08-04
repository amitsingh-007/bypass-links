import { ContextBookmark, IBookmarksObj, IFolderMetaData } from '../interfaces';
import { getDecryptedBookmark, getDecryptedFolder } from '../utils';

export const bookmarksMapper = (
  [_key, { isDir, hash }]: [string, IFolderMetaData],
  urlList: IBookmarksObj['urlList'],
  folderList: IBookmarksObj['folderList']
): ContextBookmark => {
  if (isDir) {
    const folder = getDecryptedFolder(folderList[hash]);
    return {
      isDir,
      name: folder.name,
      isDefault: Boolean(folder.isDefault),
    };
  }

  const bookmark = getDecryptedBookmark(urlList[hash]);
  return {
    isDir,
    url: bookmark.url,
    title: bookmark.title,
    taggedPersons: bookmark.taggedPersons,
  };
};
