import { use } from 'react';
import useSWR from 'swr';

import { STORAGE_KEYS } from '../../../constants/storage';
import DynamicContext from '../../../provider/DynamicContext';
import { swrKeys } from '../../../swr/keys';
import { type IBookmarksObj } from '../interfaces';

/**
 * Reads through DynamicContext.storage rather than a per-app fetcher, so
 * swapping a platform's backing store stays a provider-level change instead
 * of leaving pages that know the storage key and value type behind.
 */
const useBookmarks = () => {
  const { storage } = use(DynamicContext);
  return useSWR(swrKeys.bookmarks, async () =>
    storage.get<IBookmarksObj>(STORAGE_KEYS.bookmarks)
  );
};

export default useBookmarks;
