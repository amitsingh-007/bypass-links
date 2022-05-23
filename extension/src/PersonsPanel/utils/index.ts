import storage from 'GlobalHelpers/chrome/storage';
import { CACHE_BUCKET_KEYS } from 'GlobalConstants/cache';
import { STORAGE_KEYS } from 'GlobalConstants';
import { getBlobUrlFromCache } from 'GlobalUtils/cache';
import { getPersons } from 'GlobalHelpers/fetchFromStorage';
import { IPerson, IPersons, IPersonWithImage } from '../interfaces/persons';
import { GRID_COLUMN_SIZE } from '../constants';
import memoize from 'memoize-one/dist/memoize-one';
import { hasText } from 'GlobalUtils/search';

export const setPersonsInStorage = async (persons: IPersons) => {
  await storage.set({
    [STORAGE_KEYS.persons]: persons,
    hasPendingPersons: true,
  });
};

const decodePerson = (person: IPerson): IPerson => {
  const { uid, imageRef, name, taggedUrls } = person;
  return {
    uid,
    name: atob(name),
    imageRef: decodeURIComponent(atob(imageRef)),
    taggedUrls,
  };
};

export const getPersonsFromUids = async (uids: string[]) => {
  if (!uids) {
    return [];
  }
  const persons = await getAllDecodedPersons();
  return persons.filter((person) => uids.includes(person.uid ?? ''));
};

export const getAllDecodedPersons = async () => {
  const persons = await getPersons();
  return Object.entries(persons)
    .filter(Boolean)
    .map(([_key, person]) => decodePerson(person));
};

export const getPersonsWithImageUrl = async (
  persons: IPerson[]
): Promise<IPersonWithImage[]> => {
  if (!persons) {
    return [];
  }
  return await Promise.all(
    persons.map(async (person) => ({
      ...person,
      imageUrl: await resolvePersonImageFromUid(person.uid),
    }))
  );
};

export const resolvePersonImageFromUid = async (uid: string) => {
  const { [STORAGE_KEYS.personImageUrls]: personImages } = await storage.get(
    STORAGE_KEYS.personImageUrls
  );
  if (!personImages) {
    return '';
  }
  const imageUrl = personImages[uid];
  return await getBlobUrlFromCache(CACHE_BUCKET_KEYS.person, imageUrl);
};

export const getPersonPos = (persons: IPerson[], person: IPerson) =>
  persons.findIndex(({ uid }) => uid === person.uid);

export const getReactKey = (row: number, column: number) =>
  row * GRID_COLUMN_SIZE + column;

export const getFilteredPersons = memoize(
  (persons: IPerson[], searchText: string) =>
    persons.filter(({ name }) => !searchText || hasText(searchText, name))
);
