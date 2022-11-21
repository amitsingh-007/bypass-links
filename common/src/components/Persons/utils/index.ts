import { IPerson, IPersons } from '../interfaces/persons';
import { hasText } from '../../../utils/search';
import memoize from 'memoize-one';
import { SORT_ORDER } from '../constants/sort';

export const decodePerson = (person: IPerson): IPerson => {
  const { uid, imageRef, name, taggedUrls } = person;
  return {
    uid,
    name: atob(name),
    imageRef: decodeURIComponent(atob(imageRef)),
    taggedUrls,
  };
};

export const decodePersons = (persons: IPersons) =>
  Object.entries(persons)
    .filter(Boolean)
    .map(([_key, person]) => decodePerson(person));

export const getReactKey = (row: number, column: number, gridSize: number) =>
  row * gridSize + column;

export const getFilteredPersons = memoize(
  (persons: IPerson[], searchText: string) =>
    persons.filter(({ name }) => !searchText || hasText(searchText, name))
);

export const sortAlphabetically = <T extends IPerson>(
  sortOrder: SORT_ORDER,
  persons: T[]
) => {
  const sortedPersons = persons.sort((a, b) => a.name.localeCompare(b.name));
  if (sortOrder === SORT_ORDER.desc) {
    sortedPersons.reverse();
  }
  return [...sortedPersons];
};
