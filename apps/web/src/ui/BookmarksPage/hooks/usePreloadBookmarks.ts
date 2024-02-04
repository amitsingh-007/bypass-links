import { useUser } from '@/ui/provider/AuthProvider';
import {
  getFromLocalStorage,
  isExistsInLocalStorage,
  removeFromLocalStorage,
  setToLocalStorage,
} from '@/ui/provider/utils';
import { api } from '@/utils/api';
import {
  CACHE_BUCKET_KEYS,
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
  const hasFaviconCache = await isCachePresent(CACHE_BUCKET_KEYS.favicon);
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
  const cache = await getCacheObj(CACHE_BUCKET_KEYS.favicon);
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
    await deleteCache(CACHE_BUCKET_KEYS.favicon);
    setIsLoading(false);
  };

  return { isLoading, preloadData, clearData };
};

export default usePreloadBookmarks;
