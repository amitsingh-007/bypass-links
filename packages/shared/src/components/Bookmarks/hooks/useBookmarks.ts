import useSWR from 'swr';

import { EStorageKey } from '../../../constants/storage';
import { useDynamicContext } from '../../../provider/DynamicContext';
import { swrKeys } from '../../../swr/keys';
import { BookmarksObjSchema } from '../schema';

const useBookmarks = () => {
  const { storage } = useDynamicContext();
  return useSWR(swrKeys.bookmarks, async () =>
    storage.get(EStorageKey.bookmarks, BookmarksObjSchema)
  );
};

export default useBookmarks;
