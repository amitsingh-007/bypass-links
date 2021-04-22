import storage from "ChromeApi/storage";
import { FIREBASE_DB_REF, STORAGE_KEYS } from "GlobalConstants/index";
import {
  getFromFirebase,
  getImageFromFirebase,
  saveDataToFirebase,
} from "GlobalUtils/firebase";
import { getAllDecodedPersons } from ".";

export const syncPersonsToStorage = async () => {
  const snapshot = await getFromFirebase(FIREBASE_DB_REF.persons);
  const persons = snapshot.val();
  await storage.set({ [STORAGE_KEYS.persons]: persons });
  console.log("Persons is set to", persons);
};

export const syncPersonsFirebaseWithStorage = async () => {
  const {
    [STORAGE_KEYS.persons]: persons,
    hasPendingPersons,
  } = await storage.get([STORAGE_KEYS.persons, "hasPendingPersons"]);
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

export const cachePersonImagesInStorage = async () => {
  await refreshPersonImagesCache();
  const persons = await getAllDecodedPersons();
  const personImagesList = await Promise.all(
    persons.map(resolveImageFromPerson)
  );
  const personImages = personImagesList.reduce((obj, { uid, imageUrl }) => {
    obj[uid] = imageUrl;
    return obj;
  }, {});
  await storage.set({ [STORAGE_KEYS.personImages]: personImages });
  console.log("PersonImages is set to", personImages);
};

export const refreshPersonImagesCache = async () => {
  await storage.remove(STORAGE_KEYS.personImages);
};
