import {
  ECacheBucketKeys,
  getCacheObj,
  getDecryptedBookmark,
  getFaviconProxyUrl,
  type ContextBookmarks,
  type IBookmarksObj,
  type ITransformedBookmark,
} from '@bypass/shared';
import { SIGN_IN_TOTAL_STEPS } from '../../HomePopup/constants/progress';
import { trpcApi } from '@/apis/trpcApi';
import {
  bookmarksItem,
  personsItem,
  hasPendingBookmarksItem,
  hasPendingPersonsItem,
} from '@/storage/items';
import useProgressStore from '@/store/progress';

export const syncBookmarksToStorage = async () => {
  const bookmarks = await trpcApi.firebaseData.bookmarksGet.query();
  await bookmarksItem.setValue(bookmarks);
};

export const syncBookmarksAndPersonsFirebaseWithStorage = async () => {
  const hasPendingBookmarks = await hasPendingBookmarksItem.getValue();
  const hasPendingPersons = await hasPendingPersonsItem.getValue();
  if (!hasPendingBookmarks && !hasPendingPersons) {
    return;
  }
  const bookmarks = await bookmarksItem.getValue();
  const persons = await personsItem.getValue();
  const isSaveSuccess = await trpcApi.firebaseData.bookmarkAndPersonSave.mutate(
    { bookmarks, persons }
  );
  if (isSaveSuccess) {
    await hasPendingBookmarksItem.removeValue();
    await hasPendingPersonsItem.removeValue();
  } else {
    throw new Error('Error while syncing bookmarks from storage to firebase');
  }
};

export const resetBookmarks = async () => {
  await bookmarksItem.removeValue();
  await hasPendingBookmarksItem.removeValue();
};

export const cacheBookmarkFavicons = async () => {
  const bookmarks = await bookmarksItem.getValue();
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
  const { incrementProgress } = useProgressStore.getState();
  incrementProgress(SIGN_IN_TOTAL_STEPS);
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
