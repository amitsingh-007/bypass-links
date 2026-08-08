import useSWR from 'swr';

import { swrKeys } from '../../../swr/keys';
import useBookmark from './useBookmark';

const useDefaultFolderUrls = () => {
  const { getDefaultOrRootFolderUrls } = useBookmark();
  return useSWR(swrKeys.defaultFolderUrls, getDefaultOrRootFolderUrls);
};

export default useDefaultFolderUrls;
