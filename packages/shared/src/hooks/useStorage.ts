import { useCallback, useContext } from 'react';
import DynamicContext from '../provider/DynamicContext';
import {
  IPersons,
  PersonImageUrls,
} from '../components/Persons/interfaces/persons';
import { STORAGE_KEYS } from '../constants/storage';
import { IBookmarksObj } from '../components/Bookmarks/interfaces';

const useStorage = () => {
  const { storage } = useContext(DynamicContext);

  const getBookmarks = useCallback(
    () => storage.get<IBookmarksObj>(STORAGE_KEYS.bookmarks),
    [storage]
  );

  const getPersons = useCallback(
    () => storage.get<IPersons>(STORAGE_KEYS.persons),
    [storage]
  );

  const getPersonImageUrls = useCallback(
    () => storage.get<PersonImageUrls>(STORAGE_KEYS.personImageUrls),
    [storage]
  );

  return {
    getBookmarks,
    getPersons,
    getPersonImageUrls,
  };
};

export default useStorage;
