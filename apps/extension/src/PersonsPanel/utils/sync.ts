import { AuthProgress } from '@/HomePopup/utils/authProgress';
import {
  addToCache,
  CACHE_BUCKET_KEYS,
  FIREBASE_DB_REF,
  getCacheObj,
  IPerson,
  PersonImageUrls,
  STORAGE_KEYS,
} from '@bypass/shared';
import storage from '@helpers/chrome/storage';
import { getPersonImageUrls, getPersons } from '@helpers/fetchFromStorage';
import { getFromFirebase, saveToFirebase } from '@helpers/firebase/database';
import { getImageFromFirebase } from '@helpers/firebase/storage';
import { getAllDecodedPersons } from '.';

export const syncPersonsToStorage = async () => {
  const persons = await getFromFirebase<IPerson>(FIREBASE_DB_REF.persons);
  await storage.set({ [STORAGE_KEYS.persons]: persons });
  console.log('Persons is set to', persons);
};

export const syncPersonsFirebaseWithStorage = async () => {
  const { hasPendingPersons } = await storage.get('hasPendingPersons');
  const persons = await getPersons();
  if (!hasPendingPersons) {
    return;
  }
  console.log('Syncing persons from storage to firebase', persons);
  const isSaveSuccess = await saveToFirebase(FIREBASE_DB_REF.persons, persons);
  if (isSaveSuccess) {
    await storage.remove('hasPendingPersons');
  } else {
    throw new Error('Error while syncing persons from storage to firebase');
  }
};

export const resetPersons = async () => {
  await storage.remove([STORAGE_KEYS.persons, 'hasPendingPersons']);
};

const resolveImageFromPerson = async ({
  uid,
  imageRef,
}: Pick<IPerson, 'uid' | 'imageRef'>) => ({
  uid,
  imageUrl: await getImageFromFirebase(imageRef),
});

export const cachePersonImagesInStorage = async () => {
  AuthProgress.start('Caching person urls');
  await refreshPersonImageUrlsCache();
  const persons = await getAllDecodedPersons();
  let totalResolved = 0;
  const personImagesList = await Promise.all(
    persons.map(async (person) => {
      const url = await resolveImageFromPerson(person);
      AuthProgress.update(
        `Caching person urls: ${++totalResolved}/${persons.length}`
      );
      return url;
    })
  );
  const personImageUrls = personImagesList.reduce<PersonImageUrls>(
    (obj, { uid, imageUrl }) => {
      obj[uid] = imageUrl;
      return obj;
    },
    {}
  );
  await storage.set({ [STORAGE_KEYS.personImageUrls]: personImageUrls });
  console.log('PersonImageUrls is set to', personImageUrls);
  AuthProgress.finish('Cached person urls');
  AuthProgress.start('Caching person images');
  await cachePersonImages(personImageUrls);
  AuthProgress.finish('Cached person images');
};

export const refreshPersonImageUrlsCache = async () => {
  await storage.remove(STORAGE_KEYS.personImageUrls);
};

const cachePersonImages = async (personImageUrls: PersonImageUrls) => {
  if (!personImageUrls) {
    console.log('Unable to cache person images since no person urls');
    return;
  }
  const imageUrls = Object.values(personImageUrls);
  const cache = await getCacheObj(CACHE_BUCKET_KEYS.person);
  await cache.addAll(imageUrls);
  console.log('Initialized cache for all person urls');
};

export const updatePersonCacheAndImageUrls = async (person: IPerson) => {
  //Update person image urls in storage
  const personImageUrls = await getPersonImageUrls();
  const { uid, imageUrl } = await resolveImageFromPerson(person);
  personImageUrls[uid] = imageUrl;
  await storage.set({ [STORAGE_KEYS.personImageUrls]: personImageUrls });
  //Update person image cache
  await addToCache(CACHE_BUCKET_KEYS.person, imageUrl);
};
