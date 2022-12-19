import storage from 'GlobalHelpers/chrome/storage';
import { STORAGE_KEYS } from '@bypass/common/constants/storage';
import { getPersons } from 'GlobalHelpers/fetchFromStorage';
import {
  IPerson,
  IPersons,
} from '@bypass/common/components/Persons/interfaces/persons';
import { decodePersons } from '@bypass/common/components/Persons/utils';

export const setPersonsInStorage = async (persons: IPersons) => {
  await storage.set({
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
