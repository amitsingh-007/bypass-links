import { use, useCallback } from 'react';

import { type IBookmarksObj } from '../components/Bookmarks/interfaces';
import {
  type IPersons,
  type PersonImageUrls,
} from '../components/Persons/interfaces/persons';
import { STORAGE_KEYS } from '../constants/storage';
import DynamicContext from '../provider/DynamicContext';

const useStorage = () => {
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

  return {
    getBookmarks,
    getPersons,
    getPersonImageUrls,
  };
};

export default useStorage;
