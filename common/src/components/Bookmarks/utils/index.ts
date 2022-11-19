import { ContextBookmarks, IBookmarksObj } from '../interfaces';
import memoize from 'memoize-one';
import md5 from 'md5';
import { hasText } from '../../../utils/search';

export const isFolderEmpty = (
  folders: IBookmarksObj['folders'],
  name: string
) => {
  const folder = folders[md5(name)];
  return !folder || folder.length < 1;
};

export const getFilteredContextBookmarks = memoize(
  (contextBookmarks: ContextBookmarks, searchText: string) =>
    contextBookmarks?.filter(
      ({ url, title, name }) =>
        !searchText ||
        hasText(searchText, url) ||
        hasText(searchText, title) ||
        hasText(searchText, name)
    )
);

export const shouldRenderBookmarks = (
  folders: IBookmarksObj['folders'],
  contextBookmarks: ContextBookmarks
) => folders && contextBookmarks && contextBookmarks.length > 0;
