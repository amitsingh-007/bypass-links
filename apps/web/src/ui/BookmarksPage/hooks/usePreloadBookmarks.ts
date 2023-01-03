import { getFromFirebase } from '@/ui/firebase/database';
import { useUser } from '@/ui/provider/AuthProvider';
import {
  getFromLocalStorage,
  isExistsInLocalStorage,
  removeFromLocalStorage,
  setToLocalStorage,
} from '@/ui/provider/utils';
import {
  CACHE_BUCKET_KEYS,
  deleteCache,
  FIREBASE_DB_REF,
  getCacheObj,
  getFaviconProxyUrl,
  IBookmarksObj,
  isCachePresent,
  STORAGE_KEYS,
} from '@bypass/shared';
import { User } from 'firebase/auth';
import { useCallback, useState } from 'react';

const syncBookmarksToStorage = async (user: User) => {
  if (isExistsInLocalStorage(STORAGE_KEYS.bookmarks)) {
    return;
  }
  const data = await getFromFirebase(FIREBASE_DB_REF.bookmarks, user);
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
    await syncBookmarksToStorage(user);
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
