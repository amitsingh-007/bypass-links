import useDefaultFolderUrls from '../../Bookmarks/hooks/useDefaultFolderUrls';
import { getFilteredPersons, sortByRecency } from '../utils';
import usePersons from './usePersons';

/**
 * The order -> filter pipeline both persons panels share.
 *
 * Returns IPerson[]; avatars come from usePersonImageMap so image urls stay
 * out of the array the extension panel persists.
 *
 * The tag dropdown deliberately keeps its own hook: it needs images, and it
 * sorts alphabetically rather than leaving the list untouched when recency
 * is off. Unifying that would change visible ordering, so it is left alone.
 */
const useOrderedPersons = (orderByRecency: boolean, searchText = '') => {
  const { data: persons = [], ...rest } = usePersons();
  const { data: urls = [] } = useDefaultFolderUrls();

  const ordered = orderByRecency ? sortByRecency(persons, urls) : persons;

  return { ...rest, data: getFilteredPersons(ordered, searchText) };
};

export default useOrderedPersons;
