import { IPerson, IPersons } from '../interfaces/persons';
import { hasText } from '../../../utils/search';

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

export const getFilteredPersons = (persons: IPerson[], searchText: string) =>
  persons.filter(({ name }) => !searchText || hasText(searchText, name));

export const sortAlphabetically = <T extends IPerson>(persons: T[]) => {
  const sortedPersons = persons.sort((a, b) => a.name.localeCompare(b.name));
  return [...sortedPersons];
};
