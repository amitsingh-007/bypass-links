import md5 from 'md5';
import { hasText } from '../../../utils/search';
import {
  ContextBookmarks,
  IEncodedBookmark,
  IBookmarksObj,
} from '../interfaces';

export const isFolderEmpty = (
  folders: IBookmarksObj['folders'],
  name: string
) => {
  const folder = folders[md5(name)];
  return !folder || folder.length < 1;
};

export const getFilteredContextBookmarks = (
  contextBookmarks: ContextBookmarks,
  searchText: string
) =>
  contextBookmarks?.filter((ctx) => {
    if (!searchText) {
      return true;
    }
    if (ctx.isDir) {
      return true;
    }
    return hasText(searchText, ctx.url) || hasText(searchText, ctx.title);
  });

export const shouldRenderBookmarks = (
  folders: IBookmarksObj['folders'],
  contextBookmarks: ContextBookmarks
) => folders && contextBookmarks && contextBookmarks.length > 0;

export const getDecodedBookmark = (bookmark: IEncodedBookmark) => ({
  url: decodeURIComponent(atob(bookmark.url)),
  title: decodeURIComponent(atob(bookmark.title)),
  parentHash: bookmark.parentHash,
  taggedPersons: bookmark.taggedPersons,
});
