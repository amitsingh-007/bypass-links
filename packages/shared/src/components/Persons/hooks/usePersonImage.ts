import useSWR, { type SWRConfiguration } from 'swr';

import usePerson from './usePerson';

const usePersonImage = (uid = '', config?: SWRConfiguration<string>) => {
  const { resolvePersonImageFromUid } = usePerson();
  return useSWR(
    uid ? ['person-image', uid] : null,
    () => resolvePersonImageFromUid(uid),
    config
  );
};

export default usePersonImage;
