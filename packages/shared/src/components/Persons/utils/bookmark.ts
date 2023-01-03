import { hasText } from '../../../utils/search';
import { ModifiedBookmark } from '../interfaces/bookmark';

export const getFilteredModifiedBookmarks = (
  bookmarks: ModifiedBookmark[],
  searchText: string
) =>
  bookmarks?.filter(
    ({ url, title }) =>
      !searchText || hasText(searchText, url) || hasText(searchText, title)
  );
