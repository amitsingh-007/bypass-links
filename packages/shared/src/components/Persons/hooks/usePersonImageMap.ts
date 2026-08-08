import useSWR from 'swr';

import { swrKeys } from '../../../swr/keys';
import usePerson from './usePerson';

/** Returns a uid -> url map, so image urls stay out of the persisted array. */
const usePersonImageMap = (uids: string[]) => {
  const { getPersonImageMap } = usePerson();
  const { data } = useSWR(swrKeys.personImageMap(uids), () =>
    getPersonImageMap(uids)
  );
  return data ?? {};
};

export default usePersonImageMap;
