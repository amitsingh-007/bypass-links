import { ECacheBucketKeys } from '../../../constants/cache';
import { addAllToCache } from '../../../utils/cache';
import { matchesText } from '../../../utils/search';
import { sortByPriority } from '../../../utils/sort';
import { type IEncodedBookmark } from '../../Bookmarks/interfaces';
import {
  type IPerson,
  type IPersons,
  type PersonImageUrls,
} from '../interfaces/persons';

/** Field by field, so view-model extras cannot reach storage or Firebase. */
const getDecryptedPerson = ({ uid, name }: IPerson): IPerson => ({
  uid,
  name: atob(name),
});

export const getEncryptedPerson = ({ uid, name }: IPerson): IPerson => ({
  uid,
  name: btoa(name),
});

export const decodePersons = (persons: IPersons): IPerson[] =>
  Object.values(persons)
    .filter(Boolean)
    .map((person) => getDecryptedPerson(person));

export const getReactKey = (row: number, column: number, size: number) =>
  row * size + column;

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

  return sortByPriority(persons, (person) => person.uid, personPriorityMap);
};

export const sortAlphabetically = <T extends IPerson>(persons: T[]) =>
  persons.toSorted((a, b) => a.name.localeCompare(b.name));

export const getFilteredPersons = (persons: IPerson[], searchText: string) =>
  persons.filter(({ name }) => matchesText(searchText, name));

export const getColumnCount = (isMobile: boolean) => (isMobile ? 3 : 5);

export const getPersonImageName = (uid: string) => `${uid}.jpeg`;

export const getPersonImageNames = (uids: string[]) =>
  uids.map(getPersonImageName);

/** Re-keys the batch response by uid; a person with no avatar is omitted. */
export const mapPersonImageUrls = (
  uids: string[],
  urlsByFileName: Record<string, string>
): PersonImageUrls =>
  Object.fromEntries(
    uids
      .map((uid) => [uid, urlsByFileName[getPersonImageName(uid)]] as const)
      .filter(([, url]) => Boolean(url))
  );

export const cachePersonImages = async (personImageUrls: PersonImageUrls) => {
  if (!personImageUrls) {
    console.log('Unable to cache person images since no person urls');
    return;
  }
  await addAllToCache(ECacheBucketKeys.person, Object.values(personImageUrls));
  console.log('Initialized cache for all person urls');
};
