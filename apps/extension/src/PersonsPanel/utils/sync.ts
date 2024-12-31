import { trpcApi } from '@/apis/trpcApi';
import {
  addToCache,
  ECacheBucketKeys,
  getCacheObj,
  getPersonImageName,
  IPerson,
  PersonImageUrls,
  STORAGE_KEYS,
} from '@bypass/shared';
import { getPersonImageUrls } from '@helpers/fetchFromStorage';
import { getAllDecodedPersons } from '.';
import { nprogress } from '@mantine/nprogress';

export const syncPersonsToStorage = async () => {
  const persons = await trpcApi.firebaseData.personsGet.query();
  await chrome.storage.local.set({ [STORAGE_KEYS.persons]: persons });
};

export const resetPersons = async () => {
  await chrome.storage.local.remove([
    STORAGE_KEYS.persons,
    'hasPendingPersons',
  ]);
};

const resolveImageFromPerson = async (uid: string) => ({
  uid,
  imageUrl: await trpcApi.storage.getDownloadUrl.query(getPersonImageName(uid)),
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
  const cache = await getCacheObj(ECacheBucketKeys.person);
  await cache.addAll(imageUrls);
  console.log('Initialized cache for all person urls');
};

export const cachePersonImagesInStorage = async () => {
  await refreshPersonImageUrlsCache();
  const persons = await getAllDecodedPersons();
  const personImagesList = await Promise.all(
    persons.map((person) => resolveImageFromPerson(person.uid))
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
  nprogress.increment();
  await cachePersonImages(personImageUrls);
  nprogress.increment();
};

export const updatePersonCacheAndImageUrls = async (person: IPerson) => {
  // Update person image urls in storage
  const personImageUrls = await getPersonImageUrls();
  const { uid, imageUrl } = await resolveImageFromPerson(person.uid);
  personImageUrls[uid] = imageUrl;
  await chrome.storage.local.set({
    [STORAGE_KEYS.personImageUrls]: personImageUrls,
  });
  // Update person image cache
  await addToCache(ECacheBucketKeys.person, imageUrl);
};
