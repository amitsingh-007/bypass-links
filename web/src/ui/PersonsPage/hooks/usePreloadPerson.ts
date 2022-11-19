import { getFromFirebase } from '@/ui/firebase/database';
import { getImageFromFirebase } from '@/ui/firebase/storage';
import { useUser } from '@/ui/provider/AuthProvider';
import {
  isExistsInLocalStorage,
  removeFromLocalStorage,
  setToLocalStorage,
} from '@/ui/provider/utils';
import usePerson from '@common/components/Persons/hooks/usePerson';
import { PersonImageUrls } from '@common/components/Persons/interfaces/persons';
import { CACHE_BUCKET_KEYS } from '@common/constants/cache';
import { FIREBASE_DB_REF } from '@common/constants/firebase';
import { STORAGE_KEYS } from '@common/constants/storage';
import { deleteCache, getCacheObj, isCachePresent } from '@common/utils/cache';
import { User } from 'firebase/auth';
import { useCallback, useState } from 'react';

const cachePersonImages = async (personImageUrls: PersonImageUrls) => {
  if (!personImageUrls) {
    console.log('Unable to cache person images since no person urls');
    return;
  }
  const imageUrls = Object.values(personImageUrls);
  const cache = await getCacheObj(CACHE_BUCKET_KEYS.person);
  await cache.addAll(imageUrls);
};

const syncPersonsToStorage = async (user: User) => {
  if (isExistsInLocalStorage(STORAGE_KEYS.persons)) {
    return;
  }
  const data = await getFromFirebase(FIREBASE_DB_REF.persons, user);
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
    const hasPersonCache = await isCachePresent(CACHE_BUCKET_KEYS.person);
    if (hasPersonCache) {
      return;
    }
    const persons = await getAllDecodedPersons();
    const personImagesList = await Promise.all(
      persons.map(async (person) => {
        return {
          uid: person.uid,
          imageUrl: await getImageFromFirebase(person.imageRef, user.uid),
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
    await syncPersonsToStorage(user);
    await cachePersonAndImages();
    setIsLoading(false);
  }, [cachePersonAndImages, user]);

  const clearData = async () => {
    setIsLoading(true);
    removeFromLocalStorage(STORAGE_KEYS.persons);
    removeFromLocalStorage(STORAGE_KEYS.personImageUrls);
    await deleteCache(CACHE_BUCKET_KEYS.person);
    setIsLoading(false);
  };

  return { isLoading, preloadData, clearData };
};

export default usePreloadPerson;
