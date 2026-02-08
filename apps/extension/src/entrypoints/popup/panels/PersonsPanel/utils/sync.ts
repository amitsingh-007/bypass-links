import {
  addToCache,
  ECacheBucketKeys,
  getCacheObj,
  getPersonImageName,
  type IPerson,
  type PersonImageUrls,
  STORAGE_KEYS,
} from '@bypass/shared';
import { getPersonImageUrls } from '@helpers/fetchFromStorage';
import { nprogress } from '@mantine/nprogress';
import { getAllDecodedPersons } from '.';
import { trpcApi } from '@/apis/trpcApi';

export const syncPersonsToStorage = async () => {
  const persons = await trpcApi.firebaseData.personsGet.query();
  await browser.storage.local.set({ [STORAGE_KEYS.persons]: persons });
};

export const resetPersons = async () => {
  await browser.storage.local.remove([
    STORAGE_KEYS.persons,
    'hasPendingPersons',
  ]);
};

const resolveImageFromPerson = async (uid: string) => ({
  uid,
  imageUrl: await trpcApi.storage.getDownloadUrl.query(getPersonImageName(uid)),
});

export const refreshPersonImageUrlsCache = async () => {
  await browser.storage.local.remove(STORAGE_KEYS.personImageUrls);
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
    persons.map(async (person) => resolveImageFromPerson(person.uid))
  );
  const personImageUrls = personImagesList.reduce<PersonImageUrls>(
    (obj, { uid, imageUrl }) => {
      obj[uid] = imageUrl;
      return obj;
    },
    {}
  );
  await browser.storage.local.set({
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
  await browser.storage.local.set({
    [STORAGE_KEYS.personImageUrls]: personImageUrls,
  });
  // Update person image cache
  await addToCache(ECacheBucketKeys.person, imageUrl);
};
