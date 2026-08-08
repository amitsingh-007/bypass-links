import { use } from 'react';
import useSWR from 'swr';

import { STORAGE_KEYS } from '../../../constants/storage';
import DynamicContext from '../../../provider/DynamicContext';
import { swrKeys } from '../../../swr/keys';
import { type IBookmarksObj } from '../interfaces';

const useBookmarks = () => {
  const { storage } = use(DynamicContext);
  return useSWR(swrKeys.bookmarks, async () =>
    storage.get<IBookmarksObj>(STORAGE_KEYS.bookmarks)
  );
};

export default useBookmarks;
