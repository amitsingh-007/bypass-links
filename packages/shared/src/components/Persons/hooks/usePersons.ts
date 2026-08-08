import useSWR from 'swr';

import { swrKeys } from '../../../swr/keys';
import { sortAlphabetically } from '../utils';
import usePerson from './usePerson';

const usePersons = () => {
  const { getAllDecodedPersons } = usePerson();

  return useSWR(swrKeys.persons, async () =>
    sortAlphabetically(await getAllDecodedPersons())
  );
};

export default usePersons;
