import useSWR from 'swr';

import { swrKeys } from '../../../swr/keys';
import usePerson from './usePerson';

const useAllPersonsWithImages = () => {
  const { getAllDecodedPersons, getPersonsWithImageUrl } = usePerson();

  return useSWR(swrKeys.personsWithImages, async () =>
    getPersonsWithImageUrl(await getAllDecodedPersons())
  );
};

export default useAllPersonsWithImages;
