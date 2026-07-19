import useSWR from 'swr';

import useBookmark from '../../Bookmarks/hooks/useBookmark';
import { getDecryptedBookmark } from '../../Bookmarks/utils';
import { type IBookmarkWithFolder } from '../interfaces/bookmark';
import { getOrderedBookmarksList } from '../utils/bookmark';
import usePerson from './usePerson';

const useTaggedBookmarks = (personUid = '') => {
  const { getBookmarkFromHash, getFolderFromHash, getDefaultOrRootFolderUrls } =
    useBookmark();
  const { getPersonTaggedUrls } = usePerson();

  return useSWR(
    personUid ? ['tagged-bookmarks', personUid] : null,
    async () => {
      const taggedUrls = await getPersonTaggedUrls(personUid);
      if (!taggedUrls?.length) {
        return [];
      }

      const fetchedBookmarks = await Promise.all(
        taggedUrls.map(async (urlHash) => {
          const bookmark = await getBookmarkFromHash(urlHash);
          const parent = await getFolderFromHash(bookmark.parentHash);
          const decodedBookmark = getDecryptedBookmark(bookmark);
          return {
            ...decodedBookmark,
            parentName: parent.name,
            parentId: parent.id,
          } satisfies IBookmarkWithFolder;
        })
      );
      const defaultUrls = await getDefaultOrRootFolderUrls();
      return getOrderedBookmarksList(fetchedBookmarks, defaultUrls);
    }
  );
};

export default useTaggedBookmarks;
