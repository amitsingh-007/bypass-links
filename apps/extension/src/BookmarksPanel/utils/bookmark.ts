import { AuthProgress } from '@/HomePopup/utils/authProgress';
import {
  CACHE_BUCKET_KEYS,
  FIREBASE_DB_REF,
  getCacheObj,
  getFaviconProxyUrl,
  IBookmarksObj,
  STORAGE_KEYS,
} from '@bypass/shared';
import storage from '@helpers/chrome/storage';
import { getBookmarks } from '@helpers/fetchFromStorage';
import { getFromFirebase, saveToFirebase } from '@helpers/firebase/database';

export const syncBookmarksToStorage = async () => {
  const bookmarks = await getFromFirebase<IBookmarksObj>(
    FIREBASE_DB_REF.bookmarks
  );
  await storage.set({ [STORAGE_KEYS.bookmarks]: bookmarks });
  console.log(`Bookmarks is set to`, bookmarks);
};

export const syncBookmarksFirebaseWithStorage = async () => {
  const { hasPendingBookmarks } = await storage.get('hasPendingBookmarks');
  const bookmarks = await getBookmarks();
  if (!hasPendingBookmarks) {
    return;
  }
  console.log('Syncing bookmarks from storage to firebase', bookmarks);
  const isSaveSuccess = await saveToFirebase(
    FIREBASE_DB_REF.bookmarks,
    bookmarks
  );
  if (isSaveSuccess) {
    await storage.remove('hasPendingBookmarks');
  } else {
    throw new Error('Error while syncing bookmarks from storage to firebase');
  }
};

export const resetBookmarks = async () => {
  await storage.remove([STORAGE_KEYS.bookmarks, 'hasPendingBookmarks']);
};

export const cacheBookmarkFavicons = async () => {
  const bookmarks = await getBookmarks();
  if (!bookmarks) {
    return;
  }
  AuthProgress.start('Caching favicons');
  const { urlList } = bookmarks;
  let totalResolved = 0;
  const faviconUrls = Object.values(urlList).map(({ url }) =>
    getFaviconProxyUrl(decodeURIComponent(atob(url)))
  );
  const uniqueUrls = Array.from(new Set(faviconUrls));
  const cache = await getCacheObj(CACHE_BUCKET_KEYS.favicon);
  await Promise.all(
    uniqueUrls.map(async (url) => {
      const urlPromise = await cache.add(url);
      totalResolved += 1;
      AuthProgress.update(
        `Caching favicons: ${totalResolved}/${uniqueUrls.length}`
      );
      return urlPromise;
    })
  );
  console.log('Initialized cache for all bookmark urls');
  AuthProgress.finish('Cached favicons');
};
