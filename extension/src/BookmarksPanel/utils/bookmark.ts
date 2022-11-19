import { FIREBASE_DB_REF } from '@common/constants/firebase';
import { STORAGE_KEYS } from '@common/constants/storage';
import { CACHE_BUCKET_KEYS } from '@common/constants/cache';
import storage from 'GlobalHelpers/chrome/storage';
import { getBookmarks } from 'GlobalHelpers/fetchFromStorage';
import {
  getFromFirebase,
  saveToFirebase,
} from 'GlobalHelpers/firebase/database';
import { getCacheObj } from '@common/utils/cache';
import { AuthProgress } from 'SrcPath/HomePopup/utils/authProgress';
import { getFaviconProxyUrl } from '@common/utils';
import { IBookmarksObj } from '@common/components/Bookmarks/interfaces';

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
      AuthProgress.update(
        `Caching favicons: ${++totalResolved}/${uniqueUrls.length}`
      );
      return urlPromise;
    })
  );
  console.log('Initialized cache for all bookmark urls');
  AuthProgress.finish('Cached favicons');
};
