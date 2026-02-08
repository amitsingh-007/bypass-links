import {
  type BMPanelQueryParams,
  deserializeQueryStringToObject,
  type EBookmarkOperation,
  ROUTES,
} from '@bypass/shared';
import { Route, useSearch } from 'wouter';
import BookmarksPanel from '../components/BookmarksPanel';

const getQueryParams = (qs: string): BMPanelQueryParams => {
  const { folderId, bmUrl, operation } = deserializeQueryStringToObject(qs);
  return {
    folderId,
    operation: operation as EBookmarkOperation,
    bmUrl,
  };
};

function BookmarksPanelWrapper() {
  const search = useSearch();
  const queryParams = getQueryParams(search);

  return <BookmarksPanel {...queryParams} />;
}

export const BookmarksPanelRoute = (
  <Route path={ROUTES.BOOKMARK_PANEL} component={BookmarksPanelWrapper} />
);
