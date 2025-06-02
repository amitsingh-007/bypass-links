import {
  decodePersons,
  type IPerson,
  type IPersons,
  STORAGE_KEYS,
} from '@bypass/shared';
import { getPersons } from '@helpers/fetchFromStorage';

export const setPersonsInStorage = async (persons: IPersons) => {
  await chrome.storage.local.set({
    [STORAGE_KEYS.persons]: persons,
    hasPendingPersons: true,
  });
};

export const getAllDecodedPersons = async () => {
  const persons = await getPersons();
  return decodePersons(persons);
};

export const getPersonPos = (persons: IPerson[], person: IPerson) =>
  persons.findIndex(({ uid }) => uid === person.uid);
