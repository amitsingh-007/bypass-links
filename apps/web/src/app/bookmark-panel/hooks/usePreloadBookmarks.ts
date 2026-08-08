import {
  ECacheBucketKeys,
  addAllToCache,
  type IBookmarksObj,
  STORAGE_KEYS,
  deleteCache,
  getBookmarkFaviconUrls,
  isCachePresent,
  invalidateBookmarkKeys,
} from '@bypass/shared';
import { useState } from 'react';

import { getFaviconUrl } from '@app/constants/favicon';
import { useUser } from '@app/provider/AuthProvider';
import { api } from '@app/utils/api';
import {
  getFromLocalStorage,
  isExistsInLocalStorage,
  removeFromLocalStorage,
  setToLocalStorage,
} from '@app/utils/storage';

const syncBookmarksToStorage = async () => {
  if (isExistsInLocalStorage(STORAGE_KEYS.bookmarks)) {
    return;
  }
  const data = await api.firebaseData.bookmarksGet.query();
  setToLocalStorage(STORAGE_KEYS.bookmarks, data);
};

const cacheBookmarkFavicons = async () => {
  const hasFaviconCache = await isCachePresent(ECacheBucketKeys.favicon);
  if (hasFaviconCache) {
    return;
  }
  const bookmarks = getFromLocalStorage<IBookmarksObj>(STORAGE_KEYS.bookmarks);
  if (!bookmarks) {
    return;
  }
  const faviconUrls = getBookmarkFaviconUrls(bookmarks.urlList, getFaviconUrl);
  await addAllToCache(ECacheBucketKeys.favicon, faviconUrls);
};

const usePreloadBookmarks = () => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const preloadData = async () => {
    if (!user) {
      return;
    }
    setIsLoading(true);
    try {
      await syncBookmarksToStorage();
      await cacheBookmarkFavicons();
      await invalidateBookmarkKeys();
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = async () => {
    setIsLoading(true);
    removeFromLocalStorage(STORAGE_KEYS.bookmarks);
    await deleteCache(ECacheBucketKeys.favicon);
    await invalidateBookmarkKeys();
    setIsLoading(false);
  };

  return { isLoading, preloadData, clearData };
};

export default usePreloadBookmarks;
