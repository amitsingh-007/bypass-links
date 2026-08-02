import { useCallback } from 'react';

import { ECacheBucketKeys } from '../../../constants/cache';
import useStorage from '../../../hooks/useStorage';
import {
  getBlobUrlFromCache,
  getBlobUrlFromOpenCache,
  getCacheObj,
} from '../../../utils/cache';
import { type IPerson, type IPersonWithImage } from '../interfaces/persons';
import { decodePersons } from '../utils';

const usePerson = () => {
  const { getBookmarks, getPersons, getPersonImageUrls } = useStorage();

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
        // Matches resolvePersonImageFromUid: bail before touching CacheStorage
        return persons.map((person) => ({ ...person, imageUrl: '' }));
      }
      // Open the bucket once for the whole list rather than once per person
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
