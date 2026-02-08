import {
  addToCache,
  ECacheBucketKeys,
  getCacheObj,
  getPersonImageName,
  type IPerson,
  type PersonImageUrls,
} from '@bypass/shared';
import { nprogress } from '@mantine/nprogress';
import { getAllDecodedPersons } from '.';
import { trpcApi } from '@/apis/trpcApi';
import {
  personsItem,
  personImageUrlsItem,
  hasPendingPersonsItem,
} from '@/storage/items';
import { getPersonImageUrls } from '@/storage';

export const syncPersonsToStorage = async () => {
  const persons = await trpcApi.firebaseData.personsGet.query();
  await personsItem.setValue(persons);
};

export const resetPersons = async () => {
  await personsItem.removeValue();
  await hasPendingPersonsItem.removeValue();
};

const resolveImageFromPerson = async (uid: string) => ({
  uid,
  imageUrl: await trpcApi.storage.getDownloadUrl.query(getPersonImageName(uid)),
});

export const refreshPersonImageUrlsCache = async () => {
  await personImageUrlsItem.removeValue();
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
  await personImageUrlsItem.setValue(personImageUrls);
  nprogress.increment();
  await cachePersonImages(personImageUrls);
  nprogress.increment();
};

export const updatePersonCacheAndImageUrls = async (person: IPerson) => {
  // Update person image urls in storage
  const personImageUrls = await getPersonImageUrls();
  const { uid, imageUrl } = await resolveImageFromPerson(person.uid);
  personImageUrls[uid] = imageUrl;
  await personImageUrlsItem.setValue(personImageUrls);
  // Update person image cache
  await addToCache(ECacheBucketKeys.person, imageUrl);
};
