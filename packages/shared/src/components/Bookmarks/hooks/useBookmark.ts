import { EStorageKey } from '../../../constants/storage';
import { useDynamicContext } from '../../../provider/DynamicContext';
import { ROOT_FOLDER_ID } from '../constants';
import { BookmarksObjSchema } from '../schema';
import { getDecryptedFolder, getDefaultFolder } from '../utils';

const useBookmark = () => {
  const { storage } = useDynamicContext();

  const getBookmarks = async () =>
    storage.get(EStorageKey.bookmarks, BookmarksObjSchema);

  const getFolderFromHash = async (hash: string) => {
    const bookmarks = await getBookmarks();
    if (!bookmarks) {
      throw new Error('No bookmarks found for getFolderFromHash');
    }
    return getDecryptedFolder(bookmarks.folderList[hash]);
  };

  const getDefaultOrRootFolderUrls = async () => {
    const bookmarks = await getBookmarks();
    if (!bookmarks) {
      throw new Error('No bookmarks found for getDefaultOrRootFolderUrls');
    }
    const folderList = Object.values(bookmarks.folderList);
    const defaultFolder = getDefaultFolder(folderList);
    const parentHash = defaultFolder?.id ?? ROOT_FOLDER_ID;

    return Object.values(bookmarks.folders[parentHash] ?? [])
      .filter((bookmark) => !bookmark.isDir)
      .map((urlData) => bookmarks.urlList[urlData.hash]);
  };

  return {
    getFolderFromHash,
    getDefaultOrRootFolderUrls,
  };
};

export default useBookmark;
