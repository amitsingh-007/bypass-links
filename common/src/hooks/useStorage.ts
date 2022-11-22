import { useContext } from 'react';
import DynamicContext from '../provider/DynamicContext';
import { IPersons } from '../components/Persons/interfaces/persons';
import { STORAGE_KEYS } from '../constants/storage';
import { IBookmarksObj } from '../components/Bookmarks/interfaces';

const useStorage = () => {
  const { storage } = useContext(DynamicContext);

  const getBookmarks = () => storage.get<IBookmarksObj>(STORAGE_KEYS.bookmarks);

  const getPersons = () => storage.get<IPersons>(STORAGE_KEYS.persons);

  const getPersonImageUrls = () =>
    storage.get<any>(STORAGE_KEYS.personImageUrls);

  return {
    getBookmarks,
    getPersons,
    getPersonImageUrls,
  };
};

export default useStorage;
