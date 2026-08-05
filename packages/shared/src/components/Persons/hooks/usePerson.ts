import { use, useCallback } from 'react';

import { ECacheBucketKeys } from '../../../constants/cache';
import { STORAGE_KEYS } from '../../../constants/storage';
import DynamicContext from '../../../provider/DynamicContext';
import {
  getBlobUrlFromCache,
  getBlobUrlFromOpenCache,
  getCacheObj,
} from '../../../utils/cache';
import { type IBookmarksObj } from '../../Bookmarks/interfaces';
import {
  type IPerson,
  type IPersonWithImage,
  type IPersons,
  type PersonImageUrls,
} from '../interfaces/persons';
import { decodePersons } from '../utils';

const usePerson = () => {
  const { storage } = use(DynamicContext);
  const getBookmarks = useCallback(
    async () => storage.get<IBookmarksObj>(STORAGE_KEYS.bookmarks),
    [storage]
  );
  const getPersons = useCallback(
    async () => storage.get<IPersons>(STORAGE_KEYS.persons),
    [storage]
  );
  const getPersonImageUrls = useCallback(
    async () => storage.get<PersonImageUrls>(STORAGE_KEYS.personImageUrls),
    [storage]
  );

  const getAllDecodedPersons = useCallback(async () => {
    const persons = await getPersons();
    if (!persons) return [];
    return decodePersons(persons);
  }, [getPersons]);

  const resolvePersonImageFromUid = useCallback(
    async (uid: string) => {
      const personImages = await getPersonImageUrls();
      if (!personImages) {
        return '';
      }
      const imageUrl = personImages[uid];
      return getBlobUrlFromCache(ECacheBucketKeys.person, imageUrl);
    },
    [getPersonImageUrls]
  );

  const getPersonsWithImageUrl = useCallback(
    async (persons: IPerson[]): Promise<IPersonWithImage[]> => {
      if (!persons?.length) {
        return [];
      }
      const personImages = await getPersonImageUrls();
      if (!personImages) {
        return persons.map((person) => ({ ...person, imageUrl: '' }));
      }
      // Open the bucket once for the whole list
      const cache = await getCacheObj(ECacheBucketKeys.person);
      return Promise.all(
        persons.map(async (person) => ({
          ...person,
          imageUrl: await getBlobUrlFromOpenCache(
            cache,
            personImages[person.uid]
          ),
        }))
      );
    },
    [getPersonImageUrls]
  );

  const getPersonTaggedUrls = useCallback(
    async (personId: string) => {
      const bookmarks = await getBookmarks();
      if (!bookmarks?.urlList) {
        return [];
      }
      const taggedUrls = [];
      for (const [bmId, bookmark] of Object.entries(bookmarks.urlList)) {
        if (bookmark.taggedPersons.includes(personId)) {
          taggedUrls.push(bmId);
        }
      }
      return taggedUrls;
    },
    [getBookmarks]
  );

  return {
    getAllDecodedPersons,
    resolvePersonImageFromUid,
    getPersonsWithImageUrl,
    getPersonTaggedUrls,
  };
};

export default usePerson;
