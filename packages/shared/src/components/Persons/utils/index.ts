import { IPerson, IPersons } from '../interfaces/persons';
import { hasText } from '../../../utils/search';
import { IEncodedBookmark } from '../../Bookmarks/interfaces';

export const getDecryptedPerson = (person: IPerson): IPerson => {
  return {
    ...person,
    name: atob(person.name),
  };
};

export const getEncryptedPerson = (person: IPerson): IPerson => {
  return {
    ...person,
    name: btoa(person.name),
  };
};

export const decodePersons = (persons: IPersons) =>
  Object.values(persons)
    .filter(Boolean)
    .map((person) => getDecryptedPerson(person));

export const getReactKey = (row: number, column: number, size: number) =>
  row * size + column;

export const getOrderedPersons = (
  persons: IPerson[],
  urls: IEncodedBookmark[]
) => {
  const personPriorityMap: Record<string, number> = {};
  urls.forEach((url, index) => {
    url.taggedPersons.forEach((taggedPerson) => {
      personPriorityMap[taggedPerson] = index;
    });
  });

  return [...persons].toSorted((p1, p2) => {
    const priority1 = personPriorityMap[p1.uid] ?? -1;
    const priority2 = personPriorityMap[p2.uid] ?? -1;
    return priority2 - priority1;
  });
};

export const getFilteredPersons = (persons: IPerson[], searchText: string) =>
  persons.filter(({ name }) => !searchText || hasText(searchText, name));

export const sortAlphabetically = <T extends IPerson>(persons: T[]) => {
  const sortedPersons = persons.sort((a, b) => a.name.localeCompare(b.name));
  return [...sortedPersons];
};

export const getColumnCount = (isMobile: boolean) => (isMobile ? 3 : 5);

export const getPersonImageName = (uid: string) => `${uid}.jpeg`;
