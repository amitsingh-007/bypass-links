import { FIREBASE_DB_REF } from "@common/constants/firebase";
import { STORAGE_KEYS } from "GlobalConstants";
import { CACHE_BUCKET_KEYS } from "GlobalConstants/cache";
import storage from "GlobalHelpers/chrome/storage";
import { getPersonImageUrls, getPersons } from "GlobalHelpers/fetchFromStorage";
import {
  getFromFirebase,
  getImageFromFirebase,
  saveToFirebase,
} from "GlobalHelpers/firebase";
import { addToCache, getCacheObj } from "GlobalUtils/cache";
import { dispatchAuthenticationEvent } from "SrcPath/HomePopup/utils/authentication";
import { getAllDecodedPersons } from ".";
import { IPerson, PersonImageUrls } from "../interfaces/persons";

export const syncPersonsToStorage = async () => {
  const persons = await getFromFirebase<IPerson>(FIREBASE_DB_REF.persons);
  await storage.set({ [STORAGE_KEYS.persons]: persons });
  console.log("Persons is set to", persons);
};

export const syncPersonsFirebaseWithStorage = async () => {
  const { hasPendingPersons } = await storage.get("hasPendingPersons");
  const persons = await getPersons();
  if (!hasPendingPersons) {
    return;
  }
  console.log("Syncing persons from storage to firebase", persons);
  const isSaveSuccess = await saveToFirebase(FIREBASE_DB_REF.persons, persons);
  if (isSaveSuccess) {
    await storage.remove("hasPendingPersons");
  } else {
    throw new Error("Error while syncing persons from storage to firebase");
  }
};

export const resetPersons = async () => {
  await storage.remove([STORAGE_KEYS.persons, "hasPendingPersons"]);
};

const resolveImageFromPerson = async ({
  uid,
  imageRef,
}: Pick<IPerson, "uid" | "imageRef">) => ({
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
  const personImageUrls = personImagesList.reduce<PersonImageUrls>(
    (obj, { uid, imageUrl }) => {
      obj[uid] = imageUrl;
      return obj;
    },
    {}
  );
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
  const personImageUrls = await getPersonImageUrls();
  if (!personImageUrls) {
    console.log("Unable to cache person images since no person urls");
    return;
  }
  const imageUrls = Object.values(personImageUrls);
  const cache = await getCacheObj(CACHE_BUCKET_KEYS.person);
  await cache.addAll(imageUrls);
  console.log("Initialized cache for all person urls");
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
