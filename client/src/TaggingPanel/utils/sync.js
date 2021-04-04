import storage from "ChromeApi/storage";
import { FIREBASE_DB_REF, STORAGE_KEYS } from "GlobalConstants/index";
import { getFromFirebase, saveDataToFirebase } from "GlobalUtils/firebase";

export const syncPersonsToStorage = async () => {
  const snapshot = await getFromFirebase(FIREBASE_DB_REF.persons);
  const persons = snapshot.val();
  await storage.set({ [STORAGE_KEYS.persons]: persons });
  console.log("Perons is set to", persons);
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
