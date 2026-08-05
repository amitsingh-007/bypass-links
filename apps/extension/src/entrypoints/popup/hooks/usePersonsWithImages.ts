import {
  sortAlphabetically,
  sortByRecency,
  useAllPersonsWithImages,
  useBookmark,
} from '@bypass/shared';
import useSWR from 'swr';

/**
 * Sorts the shared all-persons entry; ordering is applied here so the shared
 * cache key stays stable across orderings.
 */
const usePersonsWithImages = (orderByRecency: boolean) => {
  const { getDefaultOrRootFolderUrls } = useBookmark();
  const { data: personsWithImageUrl = [], ...rest } = useAllPersonsWithImages();
  // `= []` matters: sortByRecency iterates urls unguarded, and this hook renders
  // in the bookmark edit dialog where the persons panel never mounted
  const { data: urls = [] } = useSWR(
    'default-folder-urls',
    getDefaultOrRootFolderUrls
  );

  const data = orderByRecency
    ? sortByRecency(personsWithImageUrl, urls)
    : sortAlphabetically(personsWithImageUrl);

  return { ...rest, data };
};

export default usePersonsWithImages;
