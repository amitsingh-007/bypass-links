import useSWR, { type SWRConfiguration } from 'swr';

import { swrKeys } from '../../../swr/keys';
import { sortAlphabetically } from '../utils';
import usePerson from './usePerson';

export const usePersons = () => {
  const { getAllDecodedPersons } = usePerson();

  return useSWR(swrKeys.persons, async () =>
    sortAlphabetically(await getAllDecodedPersons())
  );
};

export const useAllPersonsWithImages = () => {
  const { getAllDecodedPersons, getPersonsWithImageUrl } = usePerson();

  return useSWR(swrKeys.personsWithImages, async () =>
    getPersonsWithImageUrl(await getAllDecodedPersons())
  );
};

export const usePersonImage = (uid = '', config?: SWRConfiguration<string>) => {
  const { resolvePersonImageFromUid } = usePerson();
  return useSWR(
    swrKeys.personImage(uid),
    () => resolvePersonImageFromUid(uid),
    config
  );
};

/** Returns a uid -> url map, so image urls stay out of the persisted array. */
export const usePersonImageMap = (uids: string[]) => {
  const { getPersonImageMap } = usePerson();
  const { data } = useSWR(swrKeys.personImageMap(uids), () =>
    getPersonImageMap(uids)
  );
  return data ?? {};
};
