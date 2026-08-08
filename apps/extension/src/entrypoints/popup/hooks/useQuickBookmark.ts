import { getDecryptedBookmark, swrKeys } from '@bypass/shared';
import useSWR from 'swr';

import { bookmarksItem } from '@/storage/items';
import { findBookmarkByUrl } from '@popup/panels/BookmarksPanel/utils/bookmark';

const useQuickBookmark = (enabled: boolean, url = '') =>
  useSWR(enabled ? swrKeys.quickBookmark(url) : null, async () => {
    const bookmarks = await bookmarksItem.getValue();
    if (!bookmarks) {
      return undefined;
    }
    const encodedBookmark = findBookmarkByUrl(bookmarks.urlList, url);

    return encodedBookmark ? getDecryptedBookmark(encodedBookmark) : undefined;
  });

export default useQuickBookmark;
