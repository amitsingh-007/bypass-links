import {
  BMPanelQueryParams,
  deserialzeQueryStringToObject,
  IBookmarkOperation,
  ROUTES,
} from '@bypass/shared';
import { lazy } from 'react';
import { Route, useLocation } from 'react-router-dom';

const BookmarksPanel = lazy(() => import('../components/BookmarksPanel'));
const getQueryParams = (qs: string): BMPanelQueryParams => {
  const { folderContext, bmUrl, operation } = deserialzeQueryStringToObject(qs);
  return {
    folderContext,
    operation: operation as IBookmarkOperation,
    bmUrl,
  };
};

const BookmarksPanelWrapper = () => {
  const location = useLocation();
  const queryParams = getQueryParams(location.search);
  return <BookmarksPanel {...queryParams} />;
};

export const BookmarksPanelRoute = (
  <Route path={ROUTES.BOOKMARK_PANEL} element={<BookmarksPanelWrapper />} />
);
