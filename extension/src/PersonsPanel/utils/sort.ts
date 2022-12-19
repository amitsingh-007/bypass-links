import { SORT_ORDER } from '@bypass/shared/components/Persons/constants/sort';
import { IPerson } from '@bypass/shared/components/Persons/interfaces/persons';

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
