import { useCallback } from 'react';
import useStorage from '../../../hooks/useStorage';

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
      return bookmarks.folderList[hash];
    },
    [getBookmarks]
  );

  return {
    getBookmarkFromHash,
    getFolderFromHash,
  };
};

export default useBookmark;
