import { AuthProgress } from '@/HomePopup/utils/authProgress';
import { api } from '@/utils/api';
import {
  addToCache,
  CACHE_BUCKET_KEYS,
  getCacheObj,
  IPerson,
  PersonImageUrls,
  STORAGE_KEYS,
} from '@bypass/shared';
import { getPersonImageUrls, getPersons } from '@helpers/fetchFromStorage';
import { getImageFromFirebase } from '@helpers/firebase/storage';
import { getAllDecodedPersons } from '.';

export const syncPersonsToStorage = async () => {
  const persons = await api.firebaseData.personsGet.query();
  await chrome.storage.local.set({ [STORAGE_KEYS.persons]: persons });
};

export const syncPersonsFirebaseWithStorage = async () => {
  const { hasPendingPersons } =
    await chrome.storage.local.get('hasPendingPersons');
  const persons = await getPersons();
  if (!hasPendingPersons) {
    return;
  }
  const isSaveSuccess = await api.firebaseData.personsPost.mutate(persons);
  if (isSaveSuccess) {
    await chrome.storage.local.remove('hasPendingPersons');
  } else {
    throw new Error('Error while syncing persons from storage to firebase');
  }
};

export const resetPersons = async () => {
  await chrome.storage.local.remove([
    STORAGE_KEYS.persons,
    'hasPendingPersons',
  ]);
};

const resolveImageFromPerson = async ({
  uid,
  imageRef,
}: Pick<IPerson, 'uid' | 'imageRef'>) => ({
  uid,
  imageUrl: await getImageFromFirebase(imageRef),
});

export const refreshPersonImageUrlsCache = async () => {
  await chrome.storage.local.remove(STORAGE_KEYS.personImageUrls);
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

export const cachePersonImagesInStorage = async () => {
  AuthProgress.start('Caching person urls');
  await refreshPersonImageUrlsCache();
  const persons = await getAllDecodedPersons();
  let totalResolved = 0;
  const personImagesList = await Promise.all(
    persons.map(async (person) => {
      const url = await resolveImageFromPerson(person);
      totalResolved += 1;
      AuthProgress.update(
        `Caching person urls: ${totalResolved}/${persons.length}`
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
  await chrome.storage.local.set({
    [STORAGE_KEYS.personImageUrls]: personImageUrls,
  });
  console.log('PersonImageUrls is set to', personImageUrls);
  AuthProgress.finish('Cached person urls');
  AuthProgress.start('Caching person images');
  await cachePersonImages(personImageUrls);
  AuthProgress.finish('Cached person images');
};

export const updatePersonCacheAndImageUrls = async (person: IPerson) => {
  // Update person image urls in storage
  const personImageUrls = await getPersonImageUrls();
  const { uid, imageUrl } = await resolveImageFromPerson(person);
  personImageUrls[uid] = imageUrl;
  await chrome.storage.local.set({
    [STORAGE_KEYS.personImageUrls]: personImageUrls,
  });
  // Update person image cache
  await addToCache(CACHE_BUCKET_KEYS.person, imageUrl);
};
