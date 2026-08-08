import useSWR, { type SWRConfiguration } from 'swr';

import { swrKeys } from '../../../swr/keys';
import usePerson from './usePerson';

const usePersonImage = (uid = '', config?: SWRConfiguration<string>) => {
  const { resolvePersonImageFromUid } = usePerson();
  return useSWR(
    swrKeys.personImage(uid),
    () => resolvePersonImageFromUid(uid),
    config
  );
};

export default usePersonImage;
