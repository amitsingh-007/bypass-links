import {
  sortAlphabetically,
  sortByRecency,
  useAllPersonsWithImages,
  useBookmark,
} from '@bypass/shared';
import useSWR from 'swr';

/** Sorts here rather than in the fetcher, so the shared cache key stays stable. */
const usePersonsWithImages = (orderByRecency: boolean) => {
  const { getDefaultOrRootFolderUrls } = useBookmark();
  const { data: personsWithImageUrl = [], ...rest } = useAllPersonsWithImages();
  // `= []` is load-bearing: sortByRecency iterates urls unguarded, and this also
  // renders in the bookmark edit dialog, where nothing else populates this key
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
