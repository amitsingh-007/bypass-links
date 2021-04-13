import storage from "ChromeApi/storage";
import { STORAGE_KEYS } from "GlobalConstants/index";
import { DEFAULT_PERSON_UID } from "../constants";

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

export const getPersonFromUid = async (personUid) => {
  if (!personUid || personUid === DEFAULT_PERSON_UID) {
    return {};
  }
  const persons = await getPersons();
  const person = persons[personUid];
  return decodePerson(person);
};

export const getAllPersonNames = async () => {
  const persons = await getPersons();
  return Object.entries(persons).map(([_key, person]) => decodePerson(person));
};

export const getSortedPersons = (persons) =>
  persons.sort((a, b) => a.name.localeCompare(b.name));
