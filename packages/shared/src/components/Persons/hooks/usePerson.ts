import { use } from 'react';

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

  const getBookmarks = async () =>
    storage.get<IBookmarksObj>(STORAGE_KEYS.bookmarks);

  const getPersons = async () => storage.get<IPersons>(STORAGE_KEYS.persons);

  const getPersonImageUrls = async () =>
    storage.get<PersonImageUrls>(STORAGE_KEYS.personImageUrls);

  const getAllDecodedPersons = async () => {
    const persons = await getPersons();
    if (!persons) {
      return [];
    }
    return decodePersons(persons);
  };

  const resolvePersonImageFromUid = async (uid: string) => {
    const personImages = await getPersonImageUrls();
    if (!personImages) {
      return '';
    }
    return getBlobUrlFromCache(ECacheBucketKeys.person, personImages[uid]);
  };

  // One storage read and one bucket open for a whole grid
  const getPersonImageMap = async (
    uids: string[]
  ): Promise<Record<string, string>> => {
    if (!uids.length) {
      return {};
    }
    const personImages = await getPersonImageUrls();
    if (!personImages) {
      return {};
    }
    const cache = await getCacheObj(ECacheBucketKeys.person);
    const entries = await Promise.all(
      uids.map(
        async (uid) =>
          [
            uid,
            await getBlobUrlFromOpenCache(cache, personImages[uid]),
          ] as const
      )
    );
    return Object.fromEntries(entries);
  };

  const getPersonsWithImageUrl = async (
    persons: IPerson[]
  ): Promise<IPersonWithImage[]> => {
    const imageMap = await getPersonImageMap(persons.map(({ uid }) => uid));
    return persons.map((person) => ({
      ...person,
      imageUrl: imageMap[person.uid] ?? '',
    }));
  };

  const getPersonTaggedUrls = async (personId: string) => {
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
  };

  return {
    getAllDecodedPersons,
    resolvePersonImageFromUid,
    getPersonImageMap,
    getPersonsWithImageUrl,
    getPersonTaggedUrls,
  };
};

export default usePerson;
