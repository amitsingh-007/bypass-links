import { use, useCallback } from 'react';

import { STORAGE_KEYS } from '../../../constants/storage';
import DynamicContext from '../../../provider/DynamicContext';
import { ROOT_FOLDER_ID } from '../constants';
import { type IBookmarksObj } from '../interfaces';
import { getDecryptedFolder, getDefaultFolder } from '../utils';

const useBookmark = () => {
  const { storage } = use(DynamicContext);
  const getBookmarks = useCallback(
    async () => storage.get<IBookmarksObj>(STORAGE_KEYS.bookmarks),
    [storage]
  );

  const getFolderFromHash = useCallback(
    async (hash: string) => {
      const bookmarks = await getBookmarks();
      if (!bookmarks) {
        throw new Error('No bookmarks found for getFolderFromHash');
      }
      return getDecryptedFolder(bookmarks.folderList[hash]);
    },
    [getBookmarks]
  );

  const getDefaultOrRootFolderUrls = useCallback(async () => {
    const bookmarks = await getBookmarks();
    if (!bookmarks) {
      throw new Error('No bookmarks found for getDefaultOrRootFolderUrls');
    }
    const folderList = Object.values(bookmarks.folderList);
    const defaultFolder = getDefaultFolder(folderList);
    const parentHash = defaultFolder?.id ?? ROOT_FOLDER_ID;

    return Object.values(bookmarks.folders[parentHash])
      .filter((bookmark) => !bookmark.isDir)
      .map((urlData) => bookmarks.urlList[urlData.hash]);
  }, [getBookmarks]);

  return {
    getFolderFromHash,
    getDefaultOrRootFolderUrls,
  };
};

export default useBookmark;
