import {
  BMPanelQueryParams,
  deserializeQueryStringToObject,
  EBookmarkOperation,
  ROUTES,
} from '@bypass/shared';
import { Route, useLocation } from 'react-router-dom';
import BookmarksPanel from '../components/BookmarksPanel';

const getQueryParams = (qs: string): BMPanelQueryParams => {
  const { folderContext, bmUrl, operation } =
    deserializeQueryStringToObject(qs);
  return {
    folderContext,
    operation: operation as EBookmarkOperation,
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
