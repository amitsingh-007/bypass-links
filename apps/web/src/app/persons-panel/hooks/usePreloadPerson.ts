import { useUser } from '@app/provider/AuthProvider';
import { api } from '@app/utils/api';
import {
  isExistsInLocalStorage,
  removeFromLocalStorage,
  setToLocalStorage,
} from '@app/utils/storage';
import {
  ECacheBucketKeys,
  PersonImageUrls,
  STORAGE_KEYS,
  deleteCache,
  getCacheObj,
  getPersonImageName,
  isCachePresent,
  usePerson,
} from '@bypass/shared';
import { useCallback, useState } from 'react';

const cachePersonImages = async (personImageUrls: PersonImageUrls) => {
  if (!personImageUrls) {
    console.log('Unable to cache person images since no person urls');
    return;
  }
  const imageUrls = Object.values(personImageUrls);
  const cache = await getCacheObj(ECacheBucketKeys.person);
  await cache.addAll(imageUrls);
};

const syncPersonsToStorage = async () => {
  if (isExistsInLocalStorage(STORAGE_KEYS.persons)) {
    return;
  }
  const data = await api.firebaseData.personsGet.query();
  await setToLocalStorage(STORAGE_KEYS.persons, data);
};

const usePreloadPerson = () => {
  const { user } = useUser();
  const { getAllDecodedPersons } = usePerson();
  const [isLoading, setIsLoading] = useState(false);

  const cachePersonAndImages = useCallback(async () => {
    if (!user) {
      return;
    }
    const hasPersonCache = await isCachePresent(ECacheBucketKeys.person);
    if (hasPersonCache) {
      return;
    }
    const persons = await getAllDecodedPersons();
    const personImagesList = await Promise.all(
      persons.map(async (person) => {
        return {
          uid: person.uid,
          imageUrl: await api.storage.getDownloadUrl.query(
            getPersonImageName(person.uid)
          ),
        };
      })
    );
    const personImageUrls = personImagesList.reduce<PersonImageUrls>(
      (obj, { uid, imageUrl }) => {
        obj[uid] = imageUrl;
        return obj;
      },
      {}
    );
    await setToLocalStorage(STORAGE_KEYS.personImageUrls, personImageUrls);
    await cachePersonImages(personImageUrls);
  }, [getAllDecodedPersons, user]);

  const preloadData = useCallback(async () => {
    if (!user) {
      return;
    }
    setIsLoading(true);
    await syncPersonsToStorage();
    await cachePersonAndImages();
    setIsLoading(false);
  }, [cachePersonAndImages, user]);

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
