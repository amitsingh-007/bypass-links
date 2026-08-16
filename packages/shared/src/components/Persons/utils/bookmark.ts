import { matchesText } from '../../../utils/search';
import { sortByPriority } from '../../../utils/sort';
import { type IEncodedBookmark } from '../../Bookmarks/interfaces';
import { type IBookmarkWithFolder } from '../interfaces/bookmark';

export const getFilteredModifiedBookmarks = (
  bookmarks: IBookmarkWithFolder[],
  searchText: string
) => bookmarks.filter(({ url, title }) => matchesText(searchText, url, title));

export const getOrderedBookmarksList = (
  bookmarks: IBookmarkWithFolder[],
  urls: IEncodedBookmark[]
) => {
  const bookmarkPriorityMap = urls.reduce<Record<string, number>>(
    (acc, url, index) => {
      acc[url.id] = index;
      return acc;
    },
    {}
  );

  return sortByPriority(
    bookmarks,
    (bookmark) => bookmark.id,
    bookmarkPriorityMap
  );
};
