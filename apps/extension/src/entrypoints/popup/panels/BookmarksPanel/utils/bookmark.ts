import {
  ECacheBucketKeys,
  getCacheObj,
  getDecryptedBookmark,
  getFaviconProxyUrl,
  STORAGE_KEYS,
  type ContextBookmarks,
  type IBookmarksObj,
  type ITransformedBookmark,
} from '@bypass/shared';
import { getBookmarks, getPersons } from '@helpers/fetchFromStorage';
import { nprogress } from '@mantine/nprogress';
import { trpcApi } from '@/apis/trpcApi';

export const syncBookmarksToStorage = async () => {
  const bookmarks = await trpcApi.firebaseData.bookmarksGet.query();
  await browser.storage.local.set({ [STORAGE_KEYS.bookmarks]: bookmarks });
};

export const syncBookmarksAndPersonsFirebaseWithStorage = async () => {
  const { hasPendingBookmarks, hasPendingPersons } =
    await browser.storage.local.get([
      'hasPendingBookmarks',
      'hasPendingPersons',
    ]);
  if (!hasPendingBookmarks && !hasPendingPersons) {
    return;
  }
  const bookmarks = await getBookmarks();
  const persons = await getPersons();
  const isSaveSuccess = await trpcApi.firebaseData.bookmarkAndPersonSave.mutate(
    { bookmarks, persons }
  );
  if (isSaveSuccess) {
    await browser.storage.local.remove([
      'hasPendingBookmarks',
      'hasPendingPersons',
    ]);
  } else {
    throw new Error('Error while syncing bookmarks from storage to firebase');
  }
};

export const resetBookmarks = async () => {
  await browser.storage.local.remove([
    STORAGE_KEYS.bookmarks,
    'hasPendingBookmarks',
  ]);
};

export const cacheBookmarkFavicons = async () => {
  const bookmarks = await getBookmarks();
  if (!bookmarks) {
    return;
  }
  const { urlList } = bookmarks;
  const faviconUrls = Object.values(urlList).map((item) => {
    const bookmark = getDecryptedBookmark(item);
    return getFaviconProxyUrl(bookmark.url);
  });
  const uniqueUrls = [...new Set(faviconUrls)];
  const cache = await getCacheObj(ECacheBucketKeys.favicon);
  await Promise.all(uniqueUrls.map(async (url) => cache.add(url)));
  console.log('Initialized cache for all bookmark urls');
  nprogress.increment();
};

export const findBookmarkById = (
  contextBookmarks: ContextBookmarks,
  id: string
): ITransformedBookmark | undefined =>
  contextBookmarks.find(
    (bm): bm is ITransformedBookmark => !bm.isDir && bm.id === id
  );

export const findBookmarkByUrl = (
  urlList: IBookmarksObj['urlList'],
  url: string
) =>
  Object.values(urlList).find((encodedBookmark) => {
    const bookmark = getDecryptedBookmark(encodedBookmark);
    return bookmark.url === url;
  });
