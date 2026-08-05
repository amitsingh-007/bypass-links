import {
  ECacheBucketKeys,
  addAllToCache,
  encodeBookmarkField,
  getBookmarkFaviconUrls,
  getGoogleFaviconUrl,
  type ContextBookmarks,
  type IBookmarksObj,
  type ITransformedBookmark,
} from '@bypass/shared';

import { trpcApi } from '@/apis/trpcApi';
import {
  bookmarksItem,
  personsItem,
  hasPendingBookmarksItem,
  hasPendingPersonsItem,
} from '@/storage/items';
import useProgressStore from '@/store/progress';

import { SIGN_IN_TOTAL_STEPS } from '../../HomePopup/constants/progress';

export const syncBookmarksToStorage = async () => {
  const bookmarks = await trpcApi.firebaseData.bookmarksGet.query();
  await bookmarksItem.setValue(bookmarks);
};

export const syncBookmarksAndPersonsFirebaseWithStorage = async () => {
  const [hasPendingBookmarks, hasPendingPersons] = await Promise.all([
    hasPendingBookmarksItem.getValue(),
    hasPendingPersonsItem.getValue(),
  ]);
  if (!hasPendingBookmarks && !hasPendingPersons) {
    return;
  }
  const [bookmarks, persons] = await Promise.all([
    bookmarksItem.getValue(),
    personsItem.getValue(),
  ]);
  const isSaveSuccess = await trpcApi.firebaseData.bookmarkAndPersonSave.mutate(
    { bookmarks, persons }
  );
  if (isSaveSuccess) {
    await Promise.all([
      hasPendingBookmarksItem.removeValue(),
      hasPendingPersonsItem.removeValue(),
    ]);
  } else {
    throw new Error('Error while syncing bookmarks from storage to firebase');
  }
};

export const resetBookmarks = async () => {
  await Promise.all([
    bookmarksItem.removeValue(),
    hasPendingBookmarksItem.removeValue(),
  ]);
};

export const cacheBookmarkFavicons = async () => {
  const bookmarks = await bookmarksItem.getValue();
  if (!bookmarks) {
    return;
  }
  const faviconUrls = getBookmarkFaviconUrls(
    bookmarks.urlList,
    getGoogleFaviconUrl
  );
  await addAllToCache(ECacheBucketKeys.favicon, faviconUrls);
  console.log('Bookmark favicons cached');
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
) => {
  // Encode the needle once rather than decrypting every stored bookmark, using
  // the same encoder getEncryptedBookmark writes with so they cannot diverge
  const encodedUrl = encodeBookmarkField(url);
  return Object.values(urlList).find(
    (encodedBookmark) => encodedBookmark.url === encodedUrl
  );
};
