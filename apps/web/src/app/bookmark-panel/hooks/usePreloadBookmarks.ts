import { useUser } from '@app/provider/AuthProvider';
import { api } from '@app/utils/api';
import {
  getFromLocalStorage,
  isExistsInLocalStorage,
  removeFromLocalStorage,
  setToLocalStorage,
} from '@app/utils/storage';
import {
  ECacheBucketKeys,
  IBookmarksObj,
  STORAGE_KEYS,
  deleteCache,
  getCacheObj,
  getFaviconProxyUrl,
  isCachePresent,
} from '@bypass/shared';
import { useCallback, useState } from 'react';

const syncBookmarksToStorage = async () => {
  if (isExistsInLocalStorage(STORAGE_KEYS.bookmarks)) {
    return;
  }
  const data = await api.firebaseData.bookmarksGet.query();
  await setToLocalStorage(STORAGE_KEYS.bookmarks, data);
};

const cacheBookmarkFavicons = async () => {
  const hasFaviconCache = await isCachePresent(ECacheBucketKeys.favicon);
  if (hasFaviconCache) {
    return;
  }
  const bookmarks = await getFromLocalStorage<IBookmarksObj>(
    STORAGE_KEYS.bookmarks
  );
  if (!bookmarks) {
    return;
  }
  const { urlList } = bookmarks;
  const faviconUrls = Object.values(urlList).map(({ url }) =>
    getFaviconProxyUrl(decodeURIComponent(atob(url)))
  );
  const uniqueUrls = Array.from(new Set(faviconUrls));
  const cache = await getCacheObj(ECacheBucketKeys.favicon);
  await Promise.all(uniqueUrls.map(async (url) => cache.add(url)));
};

const usePreloadBookmarks = () => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const preloadData = useCallback(async () => {
    if (!user) {
      return;
    }
    setIsLoading(true);
    await syncBookmarksToStorage();
    await cacheBookmarkFavicons();
    setIsLoading(false);
  }, [user]);

  const clearData = async () => {
    setIsLoading(true);
    removeFromLocalStorage(STORAGE_KEYS.bookmarks);
    await deleteCache(ECacheBucketKeys.favicon);
    setIsLoading(false);
  };

  return { isLoading, preloadData, clearData };
};

export default usePreloadBookmarks;
