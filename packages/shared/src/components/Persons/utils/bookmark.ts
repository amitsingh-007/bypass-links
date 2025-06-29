import { hasText } from '../../../utils/search';
import { type IEncodedBookmark } from '../../Bookmarks/interfaces';
import { type ModifiedBookmark } from '../interfaces/bookmark';

export const getFilteredModifiedBookmarks = (
  bookmarks: ModifiedBookmark[],
  searchText: string
) =>
  bookmarks?.filter(
    ({ url, title }) =>
      !searchText || hasText(searchText, url) || hasText(searchText, title)
  );

export const getOrderedBookmarksList = (
  bookmarks: ModifiedBookmark[],
  urls: IEncodedBookmark[]
) => {
  const bookmarkPriorityMap = urls.reduce<Record<string, number>>(
    (acc, url, index) => {
      acc[url.id] = index;
      return acc;
    },
    {}
  );

  return [...bookmarks].toSorted((bm1, bm2) => {
    const priority1 = bookmarkPriorityMap[bm1.id] ?? -1;
    const priority2 = bookmarkPriorityMap[bm2.id] ?? -1;
    return priority2 - priority1;
  });
};
