import { use } from 'react';
import useSWR from 'swr';

import { STORAGE_KEYS } from '../../../constants/storage';
import DynamicContext from '../../../provider/DynamicContext';
import { swrKeys } from '../../../swr/keys';
import { type IBookmarksObj } from '../../Bookmarks/interfaces';
import {
  getDecryptedBookmark,
  getDecryptedFolder,
  getDefaultFolderUrls,
} from '../../Bookmarks/utils';
import { type IBookmarkWithFolder } from '../interfaces/bookmark';
import { getOrderedBookmarksList } from '../utils/bookmark';

const useTaggedBookmarks = (personUid = '') => {
  const { storage } = use(DynamicContext);

  return useSWR(swrKeys.taggedBookmarks(personUid), async () => {
    // One read for the whole list; the per-hash helpers re-read it twice per bookmark
    const bookmarks = await storage.get<IBookmarksObj>(STORAGE_KEYS.bookmarks);
    if (!bookmarks?.urlList) {
      return [];
    }
    const { urlList, folderList } = bookmarks;

    const fetchedBookmarks = Object.values(urlList)
      .filter((bookmark) => bookmark.taggedPersons.includes(personUid))
      .map((bookmark) => {
        const parent = getDecryptedFolder(folderList[bookmark.parentHash]);
        return Object.assign(getDecryptedBookmark(bookmark), {
          parentName: parent.name,
          parentId: parent.id,
        }) satisfies IBookmarkWithFolder;
      });
    if (!fetchedBookmarks.length) {
      return [];
    }

    return getOrderedBookmarksList(
      fetchedBookmarks,
      getDefaultFolderUrls(bookmarks)
    );
  });
};

export default useTaggedBookmarks;
