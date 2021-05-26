import { FIREBASE_DB_REF } from "@bypass-links/common/src/constants/firebase";
import storage from "ChromeApi/storage";
import { CACHE_BUCKET_KEYS } from "GlobalConstants/cache";
import { STORAGE_KEYS } from "GlobalConstants";
import { addToCache, getCacheObj } from "GlobalUtils/cache";
import {
  getFromFirebase,
  getImageFromFirebase,
  saveDataToFirebase,
} from "GlobalUtils/firebase";
import { dispatchAuthenticationEvent } from "SrcPath/HomePopup/utils/authentication";
import { getAllDecodedPersons } from ".";

export const syncPersonsToStorage = async () => {
  const snapshot = await getFromFirebase(FIREBASE_DB_REF.persons);
  const persons = snapshot.val() || {};
  await storage.set({ [STORAGE_KEYS.persons]: persons });
  console.log("Persons is set to", persons);
};

export const syncPersonsFirebaseWithStorage = async () => {
  const { [STORAGE_KEYS.persons]: persons, hasPendingPersons } =
    await storage.get([STORAGE_KEYS.persons, "hasPendingPersons"]);
  if (!hasPendingPersons) {
    return;
  }
  console.log("Syncing persons from storage to firebase", persons);
  const isSaveSuccess = await saveDataToFirebase(
    persons,
    FIREBASE_DB_REF.persons
  );
  if (isSaveSuccess) {
    await storage.remove("hasPendingPersons");
  } else {
    throw new Error("Error while syncing persons from storage to firebase");
  }
};

export const resetPersons = async () => {
  await storage.remove([STORAGE_KEYS.persons, "hasPendingPersons"]);
};

const resolveImageFromPerson = async ({ uid, imageRef }) => ({
  uid,
  imageUrl: await getImageFromFirebase(imageRef),
});

export const cachePersonImageUrlsInStorage = async () => {
  dispatchAuthenticationEvent({
    message: "Caching person urls",
    progress: 3,
    progressBuffer: 4,
    total: 5,
  });
  await refreshPersonImageUrlsCache();
  const persons = await getAllDecodedPersons();
  const personImagesList = await Promise.all(
    persons.map(resolveImageFromPerson)
  );
  const personImageUrls = personImagesList.reduce((obj, { uid, imageUrl }) => {
    obj[uid] = imageUrl;
    return obj;
  }, {});
  await storage.set({ [STORAGE_KEYS.personImageUrls]: personImageUrls });
  console.log("PersonImageUrls is set to", personImageUrls);
  dispatchAuthenticationEvent({
    message: "Cached person urls",
    progress: 4,
    progressBuffer: 4,
    total: 5,
  });
};

export const refreshPersonImageUrlsCache = async () => {
  await storage.remove(STORAGE_KEYS.personImageUrls);
};

export const cachePersonImages = async () => {
  const { [STORAGE_KEYS.personImageUrls]: personImageUrls } = await storage.get(
    STORAGE_KEYS.personImageUrls
  );
  if (!personImageUrls) {
    console.log("Unable to cache person images since no person urls");
    return;
  }
  const imageUrls = Object.values(personImageUrls);
  const cache = await getCacheObj(CACHE_BUCKET_KEYS.person);
  await cache.addAll(imageUrls);
  console.log("Initialized cache for all person urls");
};

export const updatePersonCacheAndImageUrls = async (person) => {
  //Update person image urls in storage
  const { [STORAGE_KEYS.personImageUrls]: personImageUrls } = await storage.get(
    STORAGE_KEYS.personImageUrls
  );
  const { uid, imageUrl } = await resolveImageFromPerson(person);
  personImageUrls[uid] = imageUrl;
  await storage.set({ [STORAGE_KEYS.personImageUrls]: personImageUrls });
  //Update person image cache
  await addToCache(CACHE_BUCKET_KEYS.person, imageUrl);
};
