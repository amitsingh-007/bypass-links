import storage from "ChromeApi/storage";
import { STORAGE_KEYS } from "GlobalConstants/index";
import { getImageFromFirebase } from "GlobalUtils/firebase";

export const getPersons = async () => {
  const { [STORAGE_KEYS.persons]: persons } = await storage.get(
    STORAGE_KEYS.persons
  );
  return persons;
};

export const setPersonsInStorage = async (persons) => {
  await storage.set({
    [STORAGE_KEYS.persons]: persons,
    hasPendingPersons: true,
  });
};

const decodePerson = (person) => {
  if (!person) {
    return {};
  }
  const { uid, imageRef, name } = person;
  return {
    uid,
    name: atob(name),
    imageRef: decodeURIComponent(atob(imageRef)),
  };
};

export const getPersonsFromUids = async (uids) => {
  if (!uids) {
    return [];
  }
  const persons = await getAllDecodedPersons();
  return persons.filter((person) => uids.includes(person.uid));
};

export const getAllDecodedPersons = async () => {
  const persons = await getPersons();
  return Object.entries(persons).map(([_key, person]) => decodePerson(person));
};

export const getSortedPersons = (persons) =>
  persons.sort((a, b) => a.name.localeCompare(b.name));

export const getPersonsWithImageUrl = async (persons) => {
  if (!persons) {
    return [];
  }
  return await Promise.all(
    persons.map(async (person) => ({
      ...person,
      imageUrl: await resolvePersonImageFromUid(person.uid),
    }))
  );
};

export const resolvePersonImageFromUid = async (uid) => {
  const { [STORAGE_KEYS.personImages]: personImages } = await storage.get(
    STORAGE_KEYS.personImages
  );
  return personImages[uid];
};

export const getPersonPos = (persons, person) =>
  persons.findIndex(({ uid }) => uid === person.uid);
