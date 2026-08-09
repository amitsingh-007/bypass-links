import { ECacheBucketKeys } from '../../../constants/cache';
import { addAllToCache } from '../../../utils/cache';
import { hasText } from '../../../utils/search';
import { type IEncodedBookmark } from '../../Bookmarks/interfaces';
import {
  type IPerson,
  type IPersons,
  type PersonImageUrls,
} from '../interfaces/persons';

/** Field by field, so view-model extras cannot reach storage or Firebase. */
export const getDecryptedPerson = ({ uid, name }: IPerson): IPerson => ({
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

  return [...persons].toSorted((p1, p2) => {
    const priority1 = personPriorityMap[p1.uid] ?? -1;
    const priority2 = personPriorityMap[p2.uid] ?? -1;
    return priority2 - priority1;
  });
};

export const sortAlphabetically = <T extends IPerson>(persons: T[]) =>
  persons.toSorted((a, b) => a.name.localeCompare(b.name));

export const getFilteredPersons = (persons: IPerson[], searchText: string) =>
  persons.filter(({ name }) => !searchText || hasText(searchText, name));

export const getColumnCount = (isMobile: boolean) => (isMobile ? 3 : 5);

export const getPersonImageName = (uid: string) => `${uid}.jpeg`;

/** Parameterised on the resolver so each app can pass its own tRPC client. */
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

export const cachePersonImages = async (personImageUrls: PersonImageUrls) => {
  if (!personImageUrls) {
    console.log('Unable to cache person images since no person urls');
    return;
  }
  await addAllToCache(ECacheBucketKeys.person, Object.values(personImageUrls));
  console.log('Initialized cache for all person urls');
};
