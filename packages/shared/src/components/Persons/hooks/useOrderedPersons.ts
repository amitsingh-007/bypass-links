import useDefaultFolderUrls from '../../Bookmarks/hooks/useDefaultFolderUrls';
import { getFilteredPersons, sortByRecency } from '../utils';
import usePersons from './usePersons';

/** No image urls: they stay out of the array the extension panel persists (see usePersonImageMap). */
const useOrderedPersons = (orderByRecency: boolean, searchText = '') => {
  const { data: persons = [], ...rest } = usePersons();
  const { data: urls = [] } = useDefaultFolderUrls();

  const ordered = orderByRecency ? sortByRecency(persons, urls) : persons;

  return { ...rest, data: getFilteredPersons(ordered, searchText) };
};

export default useOrderedPersons;
