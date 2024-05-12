import {
  BMPanelQueryParams,
  deserializeQueryStringToObject,
  EBookmarkOperation,
  ROUTES,
} from '@bypass/shared';
import { Route, useSearch } from 'wouter';
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
  const search = useSearch();
  const queryParams = getQueryParams(search);

  return <BookmarksPanel {...queryParams} />;
};

export const BookmarksPanelRoute = (
  <Route path={ROUTES.BOOKMARK_PANEL} component={BookmarksPanelWrapper} />
);
