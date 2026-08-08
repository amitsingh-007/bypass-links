import useSWR from 'swr';

import { swrKeys } from '../../../swr/keys';
import usePerson from './usePerson';

/**
 * Batched counterpart to usePersonImage: one SWR entry for a whole grid, so
 * avatars don't each open the cache and re-read the image url map.
 *
 * Returns a uid -> blob url map rather than persons enriched with an
 * imageUrl, keeping view data out of the array the panels persist.
 */
const usePersonImageMap = (uids: string[]) => {
  const { getPersonImageMap } = usePerson();
  const { data } = useSWR(swrKeys.personImageMap(uids), () =>
    getPersonImageMap(uids)
  );
  return data ?? {};
};

export default usePersonImageMap;
