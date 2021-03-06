import { SORT_ORDER } from "../constants/sort";
import { IPerson } from "../interfaces/persons";

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

export const sortByBookmarksCount = (
  sortOrder: SORT_ORDER,
  persons: IPerson[]
) => {
  const sortedPersons = persons.sort(
    (a, b) => (a.taggedUrls?.length ?? 0) - (b.taggedUrls?.length ?? 0)
  );
  if (sortOrder === SORT_ORDER.desc) {
    sortedPersons.reverse();
  }
  return [...sortedPersons];
};
