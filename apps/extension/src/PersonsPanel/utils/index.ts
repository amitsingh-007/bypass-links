import storage from '@helpers/chrome/storage';
import { STORAGE_KEYS } from '@bypass/shared/constants/storage';
import { getPersons } from '@helpers/fetchFromStorage';
import {
  IPerson,
  IPersons,
} from '@bypass/shared/components/Persons/interfaces/persons';
import { decodePersons } from '@bypass/shared/components/Persons/utils';

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
