import { useCallback } from 'react';
import md5 from 'md5';
import useStorage from '../../../hooks/useStorage';
import { getDecryptedFolder, getDefaultFolder } from '../utils';
import { DEFAULT_BOOKMARK_FOLDER } from '../constants';

const useBookmark = () => {
  const { getBookmarks } = useStorage();

  const getBookmarkFromHash = useCallback(
    async (hash: string) => {
      const bookmarks = await getBookmarks();
      if (!bookmarks) {
        throw new Error('No bookmarks found for getBookmarkFromHash');
      }
      return bookmarks.urlList[hash];
    },
    [getBookmarks]
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
    const parentHash = defaultFolder
      ? defaultFolder.id
      : md5(DEFAULT_BOOKMARK_FOLDER);

    return Object.values(bookmarks.folders[parentHash])
      .filter((bookmark) => !bookmark.isDir)
      .map((urlData) => bookmarks.urlList[urlData.hash]);
  }, [getBookmarks]);

  return {
    getBookmarkFromHash,
    getFolderFromHash,
    getDefaultOrRootFolderUrls,
  };
};

export default useBookmark;
