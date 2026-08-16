import useSWR from 'swr';

import { swrKeys } from '../../../swr/keys';
import { type PersonImageUrls } from '../interfaces/persons';
import usePerson from './usePerson';

const EMPTY_IMAGE_MAP: PersonImageUrls = {};

/** Returns a uid -> url map, so image urls stay out of the persisted array. */
const usePersonImageMap = (uids: string[]) => {
  const { getPersonImageMap } = usePerson();
  const { data } = useSWR(swrKeys.personImageMap(uids), () =>
    getPersonImageMap(uids)
  );
  return data ?? EMPTY_IMAGE_MAP;
};

export default usePersonImageMap;
