import { ROUTES } from '@bypass/common/constants/routes';
import { deserialzeQueryStringToObject } from '@bypass/common/utils/url';
import { lazy } from 'react';
import { Route, useLocation } from 'react-router-dom';
import { BMPanelQueryParams } from '@bypass/common/components/Bookmarks/interfaces/url';

const BookmarksPanel = lazy(() => import('../components/BookmarksPanel'));
const getQueryParams = (qs: string): BMPanelQueryParams => {
  const { folderContext, bmUrl, operation } = deserialzeQueryStringToObject(qs);
  return {
    folderContext,
    operation: Number(operation),
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
