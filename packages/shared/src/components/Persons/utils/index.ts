import { ECacheBucketKeys } from '../../../constants/cache';
import { addAllToCache } from '../../../utils/cache';
import { encodeName, decodeName } from '../../../utils/codec';
import { getPersonImageName } from '../../../utils/personImage';
import { matchesSearch } from '../../../utils/search';
import { type IEncodedBookmark } from '../../Bookmarks/interfaces';
import {
  type IPerson,
  type IPersons,
  type PersonImageUrls,
} from '../interfaces/persons';

/** Field by field, so view-model extras cannot reach storage or Firebase. */
const decodePerson = (person: IPerson): IPerson => ({
  uid: person.uid,
  name: decodeName(person),
});

export const encodePerson = ({ uid, name }: IPerson): IPerson =>
  encodeName({ uid, name });

export const decodePersons = (persons: IPersons): IPerson[] =>
  Object.values(persons)
    .filter(Boolean)
    .map((person) => decodePerson(person));

/**
 * Highest priority first; anything absent from the map sorts last. Shared so
 * the `?? -1` descending convention cannot drift between the two orderings.
 */
export const sortByPriority = <T>(
  items: T[],
  keyOf: (item: T) => string,
  priority: Record<string, number>
) =>
  items.toSorted(
    (a, b) => (priority[keyOf(b)] ?? -1) - (priority[keyOf(a)] ?? -1)
  );

export const sortByRecency = <T extends IPerson>(
  persons: T[],
  urls: IEncodedBookmark[]
) => {
  const personPriorityMap: Record<string, number> = {};
  urls.forEach((url, index) => {
    url.taggedPersons.forEach((taggedPerson) => {
      personPriorityMap[taggedPerson] = index;
    });
  });

  return sortByPriority(persons, ({ uid }) => uid, personPriorityMap);
};

export const sortAlphabetically = <T extends IPerson>(persons: T[]) =>
  persons.toSorted((a, b) => a.name.localeCompare(b.name));

export const getFilteredPersons = (persons: IPerson[], searchText: string) =>
  persons.filter(({ name }) => matchesSearch(searchText, name));

export const getColumnCount = (isMobile: boolean) => (isMobile ? 3 : 5);

export { getPersonImageName };

export const buildPersonImageUrls = async (
  uids: string[],
  getDownloadUrl: (fileName: string) => Promise<string>
): Promise<PersonImageUrls> =>
  Object.fromEntries(
    await Promise.all(
      uids.map(async (uid) => [
        uid,
        await getDownloadUrl(getPersonImageName(uid)),
      ])
    )
  );

export const cachePersonImages = async (personImageUrls: PersonImageUrls) =>
  addAllToCache(ECacheBucketKeys.person, Object.values(personImageUrls));
