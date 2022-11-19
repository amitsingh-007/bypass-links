import storage from 'GlobalHelpers/chrome/storage';
import { STORAGE_KEYS } from '@common/constants/storage';
import { getPersons } from 'GlobalHelpers/fetchFromStorage';
import {
  IPerson,
  IPersons,
} from '@common/components/Persons/interfaces/persons';
import { GRID_COLUMN_SIZE } from '../constants';
import memoize from 'memoize-one/dist/memoize-one';
import { decodePersons } from '@common/components/Persons/utils';
import { hasText } from '@common/utils/search';

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

export const getReactKey = (row: number, column: number) =>
  row * GRID_COLUMN_SIZE + column;

export const getFilteredPersons = memoize(
  (persons: IPerson[], searchText: string) =>
    persons.filter(({ name }) => !searchText || hasText(searchText, name))
);
