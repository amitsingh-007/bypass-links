import { AuthProgress } from '@/HomePopup/utils/authProgress';
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
  AuthProgress.start('Caching person urls');
  await refreshPersonImageUrlsCache();
  const persons = await getAllDecodedPersons();
  let totalResolved = 0;
  const personImagesList = await Promise.all(
    persons.map(async (person) => {
      const urlData = await resolveImageFromPerson(person.uid);
      totalResolved += 1;
      AuthProgress.update(
        `Caching person urls: ${totalResolved}/${persons.length}`
      );
      return urlData;
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
  AuthProgress.finish('Cached person urls');
  AuthProgress.start('Caching person images');
  await cachePersonImages(personImageUrls);
  AuthProgress.finish('Cached person images');
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
