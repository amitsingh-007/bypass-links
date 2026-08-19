import {
  type BMPanelQueryParams,
  type EBookmarkOperation,
  ROUTES,
} from '@bypass/shared';
import { Route, useSearch } from 'wouter';

import BookmarksPanel from '../components/BookmarksPanel';

const getQueryParams = (qs: string): BMPanelQueryParams => {
  const { folderId, bmUrl, operation } = Object.fromEntries(
    new URLSearchParams(qs)
  );
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
