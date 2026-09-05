import { getDecryptedBookmark } from '@bypass/shared';
import useSWR from 'swr';

import { bookmarksItem } from '@/storage/items';
import { extSwrKeys } from '@/swr/keys';
import { findBookmarkByUrl } from '@popup/panels/BookmarksPanel/utils/bookmark';

const useQuickBookmark = (enabled: boolean, url = '') =>
  useSWR(enabled ? extSwrKeys.quickBookmark(url) : null, async () => {
    const bookmarks = await bookmarksItem.getValue();
    const encodedBookmark = findBookmarkByUrl(bookmarks.urlList, url);

    return encodedBookmark ? getDecryptedBookmark(encodedBookmark) : undefined;
  });

export default useQuickBookmark;
