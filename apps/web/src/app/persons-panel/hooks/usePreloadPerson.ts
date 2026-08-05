import {
  ECacheBucketKeys,
  buildPersonImageUrls,
  cachePersonImages,
  STORAGE_KEYS,
  deleteCache,
  isCachePresent,
  usePerson,
} from '@bypass/shared';
import { useState } from 'react';

import { useUser } from '@app/provider/AuthProvider';
import { api } from '@app/utils/api';
import {
  isExistsInLocalStorage,
  removeFromLocalStorage,
  setToLocalStorage,
} from '@app/utils/storage';

const syncPersonsToStorage = async () => {
  if (isExistsInLocalStorage(STORAGE_KEYS.persons)) {
    return;
  }
  const data = await api.firebaseData.personsGet.query();
  setToLocalStorage(STORAGE_KEYS.persons, data);
};

const usePreloadPerson = () => {
  const { user } = useUser();
  const { getAllDecodedPersons } = usePerson();
  const [isLoading, setIsLoading] = useState(false);

  const cachePersonAndImages = async () => {
    if (!user) {
      return;
    }
    const hasPersonCache = await isCachePresent(ECacheBucketKeys.person);
    if (hasPersonCache) {
      return;
    }
    const persons = await getAllDecodedPersons();
    const personImageUrls = await buildPersonImageUrls(
      persons.map((person) => person.uid),
      async (fileName) => api.storage.getDownloadUrl.query(fileName)
    );
    setToLocalStorage(STORAGE_KEYS.personImageUrls, personImageUrls);
    await cachePersonImages(personImageUrls);
  };

  const preloadData = async () => {
    if (!user) {
      return;
    }
    setIsLoading(true);
    try {
      await syncPersonsToStorage();
      await cachePersonAndImages();
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = async () => {
    setIsLoading(true);
    removeFromLocalStorage(STORAGE_KEYS.persons);
    removeFromLocalStorage(STORAGE_KEYS.personImageUrls);
    await deleteCache(ECacheBucketKeys.person);
    setIsLoading(false);
  };

  return { isLoading, preloadData, clearData };
};

export default usePreloadPerson;
