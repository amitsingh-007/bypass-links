import {
  addToCache,
  buildPersonImageUrls,
  cachePersonImages,
  ECacheBucketKeys,
  getPersonImageName,
  type IPerson,
} from '@bypass/shared';

import { trpcApi } from '@/apis/trpcApi';
import {
  personsItem,
  personImageUrlsItem,
  hasPendingPersonsItem,
} from '@/storage/items';
import useProgressStore from '@/store/progress';

import { getAllDecodedPersons } from '.';
import { SIGN_IN_TOTAL_STEPS } from '../../HomePopup/constants/progress';

export const syncPersonsToStorage = async () => {
  const persons = await trpcApi.firebaseData.personsGet.query();
  await personsItem.setValue(persons);
};

export const resetPersons = async () => {
  await personsItem.removeValue();
  await hasPendingPersonsItem.removeValue();
};

const resolveDownloadUrl = async (fileName: string) =>
  trpcApi.storage.getDownloadUrl.query(fileName);

export const refreshPersonImageUrlsCache = async () => {
  await personImageUrlsItem.removeValue();
};

export const cachePersonImagesInStorage = async () => {
  const persons = await getAllDecodedPersons();
  const personImageUrls = await buildPersonImageUrls(
    persons.map((person) => person.uid),
    resolveDownloadUrl
  );
  await personImageUrlsItem.setValue(personImageUrls);
  const { incrementProgress } = useProgressStore.getState();
  incrementProgress(SIGN_IN_TOTAL_STEPS);
  await cachePersonImages(personImageUrls);
  incrementProgress(SIGN_IN_TOTAL_STEPS);
};

export const updatePersonCacheAndImageUrls = async (person: IPerson) => {
  // Update person image urls in storage
  const personImageUrls = await personImageUrlsItem.getValue();
  const imageUrl = await resolveDownloadUrl(getPersonImageName(person.uid));
  personImageUrls[person.uid] = imageUrl;
  await personImageUrlsItem.setValue(personImageUrls);
  // Update person image cache
  await addToCache(ECacheBucketKeys.person, imageUrl);
};
