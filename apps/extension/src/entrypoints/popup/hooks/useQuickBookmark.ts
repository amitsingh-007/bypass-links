import { getDecryptedBookmark } from '@bypass/shared';
import useSWR from 'swr';

import { bookmarksItem } from '@/storage/items';
import { findBookmarkByUrl } from '@popup/panels/BookmarksPanel/utils/bookmark';
import { getCurrentTab } from '@popup/utils/tabs';

const useQuickBookmark = (enabled: boolean) =>
  useSWR(enabled ? 'quick-bookmark' : null, async () => {
    const currentTab = await getCurrentTab();
    const url = currentTab?.url ?? '';
    const bookmarks = await bookmarksItem.getValue();
    if (!bookmarks) {
      return undefined;
    }
    const encodedBookmark = findBookmarkByUrl(bookmarks.urlList, url);

    return encodedBookmark ? getDecryptedBookmark(encodedBookmark) : undefined;
  });

export default useQuickBookmark;
