import useSWR from 'swr';

import useStorage from '../../../hooks/useStorage';
import { ROOT_FOLDER_ID } from '../../Bookmarks/constants';
import {
  getDecryptedBookmark,
  getDecryptedFolder,
  getDefaultFolder,
} from '../../Bookmarks/utils';
import { type IBookmarkWithFolder } from '../interfaces/bookmark';
import { getOrderedBookmarksList } from '../utils/bookmark';

const useTaggedBookmarks = (personUid = '') => {
  const { getBookmarks } = useStorage();

  return useSWR(
    personUid ? ['tagged-bookmarks', personUid] : null,
    async () => {
      // One read of the whole bookmarks object for the entire list. Resolving
      // each tagged url through useBookmark/usePerson would re-read and
      // re-parse it twice per bookmark.
      const bookmarks = await getBookmarks();
      if (!bookmarks?.urlList) {
        return [];
      }
      const { urlList, folderList, folders } = bookmarks;

      const fetchedBookmarks = Object.entries(urlList)
        .filter(([, bookmark]) => bookmark.taggedPersons.includes(personUid))
        .map(([, bookmark]) => {
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
    }
  );
};

export default useTaggedBookmarks;
