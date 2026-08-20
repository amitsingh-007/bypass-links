import {
  addToCache,
  buildPersonImageUrls,
  cachePersonImages,
  ECacheBucketKeys,
  evictBlobUrl,
  getPersonImageName,
  type IPerson,
} from '@bypass/shared';

import { trpcApi } from '@/apis/trpcApi';
import {
  personsItem,
  personImageUrlsItem,
  hasPendingPersonsItem,
} from '@/storage/items';

import { getAllDecodedPersons } from '.';

export const syncPersonsToStorage = async () => {
  const persons = await trpcApi.firebaseData.personsGet.query();
  await personsItem.setValue(persons);
};

export const resetPersons = async () => {
  await Promise.all([
    personsItem.removeValue(),
    hasPendingPersonsItem.removeValue(),
  ]);
};

const resolveDownloadUrl = async (fileName: string) =>
  trpcApi.storage.getDownloadUrl.query(fileName);

export const clearPersonImageUrls = async () => {
  await personImageUrlsItem.removeValue();
};

export const cachePersonImagesInStorage = async () => {
  const persons = await getAllDecodedPersons();
  const personImageUrls = await buildPersonImageUrls(
    persons.map((person) => person.uid),
    resolveDownloadUrl
  );
  await personImageUrlsItem.setValue(personImageUrls);
  await cachePersonImages(personImageUrls);
};

/** Delete-path counterpart: without this the url and its blob url both linger. */
export const removePersonImageUrl = async (uid: string) => {
  const personImageUrls = await personImageUrlsItem.getValue();
  const imageUrl = personImageUrls[uid];
  if (!imageUrl) {
    return;
  }
  evictBlobUrl(imageUrl);
  delete personImageUrls[uid];
  await personImageUrlsItem.setValue(personImageUrls);
};

export const updatePersonCacheAndImageUrls = async (person: IPerson) => {
  // Update person image urls in storage
  const personImageUrls = await personImageUrlsItem.getValue();
  const previousImageUrl = personImageUrls[person.uid];
  const imageUrl = await resolveDownloadUrl(getPersonImageName(person.uid));
  personImageUrls[person.uid] = imageUrl;
  await personImageUrlsItem.setValue(personImageUrls);
  // Evict both: mounted avatars may still hold the previous url, and an unchanged
  // url means these cached bytes are the ones being replaced
  evictBlobUrl(previousImageUrl);
  evictBlobUrl(imageUrl);
  await addToCache(ECacheBucketKeys.person, imageUrl);
};
