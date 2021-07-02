import { SORT_ORDER } from "../constants/sort";

export const sortAlphabetically = (sortOrder, persons) => {
  const sortedPersons = persons.sort((a, b) => a.name.localeCompare(b.name));
  if (sortOrder === SORT_ORDER.desc) {
    sortedPersons.reverse();
  }
  return [...sortedPersons];
};

export const sortByBookmarksCount = (sortOrder, persons) => {
  const sortedPersons = persons.sort(
    (a, b) => (a.taggedUrls?.length ?? 0) - (b.taggedUrls?.length ?? 0)
  );
  if (sortOrder === SORT_ORDER.desc) {
    sortedPersons.reverse();
  }
  return [...sortedPersons];
};
