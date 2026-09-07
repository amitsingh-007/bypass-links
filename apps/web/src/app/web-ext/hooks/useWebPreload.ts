import {
  ECacheBucketKeys,
  addAllToCache,
  buildPersonImageUrls,
  cachePersonImages,
  decodePersons,
  deleteCache,
  getBookmarkFaviconUrls,
  type IBookmarksObj,
  type IPersons,
  invalidateBookmarkKeys,
  invalidatePersonKeys,
  isCachePresent,
  EStorageKey,
} from '@bypass/shared';
import { useState } from 'react';

import { getFaviconUrl } from '@app/constants/favicon';
import { useUser } from '@app/provider/AuthProvider';
import { api } from '@app/utils/api';
import { getFromLocalStorage, setToLocalStorage } from '@app/utils/storage';

const syncBookmarks = async () => {
  if (!(EStorageKey.bookmarks in localStorage)) {
    const data = await api.firebaseData.bookmarksGet.query();
    setToLocalStorage(EStorageKey.bookmarks, data);
  }
  if (await isCachePresent(ECacheBucketKeys.favicon)) {
    return;
  }
  const bookmarks = getFromLocalStorage<IBookmarksObj>(EStorageKey.bookmarks);
  if (!bookmarks) {
    return;
  }
  const faviconUrls = getBookmarkFaviconUrls(bookmarks.urlList, getFaviconUrl);
  await addAllToCache(ECacheBucketKeys.favicon, faviconUrls);
};

const syncPersons = async () => {
  if (!(EStorageKey.persons in localStorage)) {
    const data = await api.firebaseData.personsGet.query();
    setToLocalStorage(EStorageKey.persons, data);
  }
  if (await isCachePresent(ECacheBucketKeys.person)) {
    return;
  }
  const persons = getFromLocalStorage<IPersons>(EStorageKey.persons);
  if (!persons) {
    return;
  }
  const personImageUrls = await buildPersonImageUrls(
    decodePersons(persons).map((person) => person.uid),
    api.storage.getDownloadUrl.query
  );
  setToLocalStorage(EStorageKey.personImageUrls, personImageUrls);
  await cachePersonImages(personImageUrls);
};

const invalidateAll = async () => {
  await Promise.all([invalidateBookmarkKeys(), invalidatePersonKeys()]);
};

const useWebPreload = () => {
  const { user, isLoginIntialized } = useUser();
  const [isSyncing, setIsSyncing] = useState(false);

  const preloadData = async () => {
    if (!user) {
      return;
    }
    setIsSyncing(true);
    try {
      await Promise.all([syncBookmarks(), syncPersons()]);
      await invalidateAll();
    } finally {
      setIsSyncing(false);
    }
  };

  const clearData = async () => {
    setIsSyncing(true);
    localStorage.removeItem(EStorageKey.bookmarks);
    localStorage.removeItem(EStorageKey.persons);
    localStorage.removeItem(EStorageKey.personImageUrls);
    await Promise.all([
      deleteCache(ECacheBucketKeys.favicon),
      deleteCache(ECacheBucketKeys.person),
    ]);
    await invalidateAll();
    setIsSyncing(false);
  };

  return { isLoading: !isLoginIntialized || isSyncing, preloadData, clearData };
};

export default useWebPreload;
