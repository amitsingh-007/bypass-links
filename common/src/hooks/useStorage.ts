import { useContext } from 'react';
import DynamicContext from '../provider/DynamicContext';
import { IPersons } from '../components/Persons/interfaces/persons';
import { STORAGE_KEYS } from '../constants/storage';

const useStorage = () => {
  const { storage } = useContext(DynamicContext);

  const getPersons = () => storage.get<IPersons>(STORAGE_KEYS.persons);

  const getPersonImageUrls = () =>
    storage.get<any>(STORAGE_KEYS.personImageUrls);

  return {
    getPersons,
    getPersonImageUrls,
  };
};

export default useStorage;
