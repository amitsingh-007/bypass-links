import useSWR from 'swr';

import { EStorageKey } from '../../../constants/storage';
import { useDynamicContext } from '../../../provider/DynamicContext';
import { swrKeys } from '../../../swr/keys';
import { ROOT_FOLDER_ID } from '../../Bookmarks/constants';
import { BookmarksObjSchema } from '../../Bookmarks/schema';
import {
  getDecryptedBookmark,
  getDecryptedFolder,
  getDefaultFolder,
} from '../../Bookmarks/utils';
import { type IBookmarkWithFolder } from '../interfaces/bookmark';
import { getOrderedBookmarksList } from '../utils/bookmark';

const useTaggedBookmarks = (personUid = '') => {
  const { storage } = useDynamicContext();

  return useSWR(swrKeys.taggedBookmarks(personUid), async () => {
    // One read for the whole list; the per-hash helpers re-read it twice per bookmark
    const bookmarks = await storage.get(
      EStorageKey.bookmarks,
      BookmarksObjSchema
    );
    if (!bookmarks?.urlList) {
      return [];
    }
    const { urlList, folderList, folders } = bookmarks;

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

    const parentHash =
      getDefaultFolder(Object.values(folderList))?.id ?? ROOT_FOLDER_ID;
    const defaultUrls = Object.values(folders[parentHash])
      .filter((bookmark) => !bookmark.isDir)
      .map((urlData) => urlList[urlData.hash]);

    return getOrderedBookmarksList(fetchedBookmarks, defaultUrls);
  });
};

export default useTaggedBookmarks;
