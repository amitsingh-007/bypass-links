import { AuthProgress } from '@/HomePopup/utils/authProgress';
import { trpcApi } from '@/apis/trpcApi';
import {
  ECacheBucketKeys,
  getCacheObj,
  getFaviconProxyUrl,
  STORAGE_KEYS,
} from '@bypass/shared';
import { getBookmarks, getPersons } from '@helpers/fetchFromStorage';

export const syncBookmarksToStorage = async () => {
  const bookmarks = await trpcApi.firebaseData.bookmarksGet.query();
  await chrome.storage.local.set({ [STORAGE_KEYS.bookmarks]: bookmarks });
};

export const syncBookmarksAndPersonsFirebaseWithStorage = async () => {
  const { hasPendingBookmarks, hasPendingPersons } =
    await chrome.storage.local.get([
      'hasPendingBookmarks',
      'hasPendingPersons',
    ]);
  if (!hasPendingBookmarks && !hasPendingPersons) {
    return;
  }
  const bookmarks = await getBookmarks();
  const persons = await getPersons();
  console.log('Syncing bookmarks from storage to firebase', bookmarks);
  console.log('Syncing persons from storage to firebase', persons);
  const isSaveSuccess = await trpcApi.firebaseData.bookmarkAndPersonSave.mutate(
    { bookmarks, persons }
  );
  if (isSaveSuccess) {
    await chrome.storage.local.remove([
      'hasPendingBookmarks',
      'hasPendingPersons',
    ]);
  } else {
    throw new Error('Error while syncing bookmarks from storage to firebase');
  }
};

export const resetBookmarks = async () => {
  await chrome.storage.local.remove([
    STORAGE_KEYS.bookmarks,
    'hasPendingBookmarks',
  ]);
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
  const uniqueUrls = [...new Set(faviconUrls)];
  const cache = await getCacheObj(ECacheBucketKeys.favicon);
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
