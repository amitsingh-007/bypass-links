import useSWR from 'swr';

import usePerson from './usePerson';

export const ALL_PERSONS_WITH_IMAGES_KEY = 'persons-with-images';

/**
 * One decode + image-resolve pass shared by every consumer. Deliberately
 * unordered: callers sort, so the cache key stays stable across orderings.
 */
const useAllPersonsWithImages = () => {
  const { getAllDecodedPersons, getPersonsWithImageUrl } = usePerson();

  return useSWR(ALL_PERSONS_WITH_IMAGES_KEY, async () =>
    getPersonsWithImageUrl(await getAllDecodedPersons())
  );
};

export default useAllPersonsWithImages;
