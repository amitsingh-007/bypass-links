import { AuthProgress } from '@/HomePopup/utils/authProgress';
import { trpcApi } from '@/apis/trpcApi';
import {
  ECacheBucketKeys,
  getCacheObj,
  getFaviconProxyUrl,
  STORAGE_KEYS,
} from '@bypass/shared';
import { getBookmarks } from '@helpers/fetchFromStorage';

export const syncBookmarksToStorage = async () => {
  const bookmarks = await trpcApi.firebaseData.bookmarksGet.query();
  await chrome.storage.local.set({ [STORAGE_KEYS.bookmarks]: bookmarks });
};

export const syncBookmarksFirebaseWithStorage = async () => {
  const { hasPendingBookmarks } = await chrome.storage.local.get(
    'hasPendingBookmarks'
  );
  const bookmarks = await getBookmarks();
  if (!hasPendingBookmarks) {
    return;
  }
  console.log('Syncing bookmarks from storage to firebase', bookmarks);
  const isSaveSuccess =
    await trpcApi.firebaseData.bookmarksPost.mutate(bookmarks);
  if (isSaveSuccess) {
    await chrome.storage.local.remove('hasPendingBookmarks');
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
