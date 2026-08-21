import { matchesSearch } from '../../../utils/search';
import { type IEncodedBookmark } from '../../Bookmarks/interfaces';
import { type IBookmarkWithFolder } from '../interfaces/bookmark';
import { sortByPriority } from './index';

export const getFilteredModifiedBookmarks = (
  bookmarks: IBookmarkWithFolder[],
  searchText: string
) =>
  bookmarks?.filter(({ url, title }) => matchesSearch(searchText, url, title));

export const getOrderedBookmarksList = (
  bookmarks: IBookmarkWithFolder[],
  urls: IEncodedBookmark[]
) =>
  sortByPriority(
    bookmarks,
    ({ id }) => id,
    Object.fromEntries(urls.map((url, index) => [url.id, index]))
  );
