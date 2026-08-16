import useSWR from 'swr';

import { swrKeys } from '../../../swr/keys';
import { sortAlphabetically } from '../utils';
import usePerson from './usePerson';

/** Sorted at the SWR layer, like usePersons, so consumers need not re-sort. */
const useAllPersonsWithImages = () => {
  const { getAllDecodedPersons, getPersonsWithImageUrl } = usePerson();

  return useSWR(swrKeys.personsWithImages, async () =>
    sortAlphabetically(
      await getPersonsWithImageUrl(await getAllDecodedPersons())
    )
  );
};

export default useAllPersonsWithImages;
