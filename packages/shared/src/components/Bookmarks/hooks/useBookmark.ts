import { use } from 'react';

import { STORAGE_KEYS } from '../../../constants/storage';
import DynamicContext from '../../../provider/DynamicContext';
import { type IBookmarksObj } from '../interfaces';
import { getDecryptedFolder, getDefaultFolderUrls } from '../utils';

const useBookmark = () => {
  const { storage } = use(DynamicContext);

  const getBookmarks = async () =>
    storage.get<IBookmarksObj>(STORAGE_KEYS.bookmarks);

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
    return getDefaultFolderUrls(bookmarks);
  };

  return {
    getFolderFromHash,
    getDefaultOrRootFolderUrls,
  };
};

export default useBookmark;
