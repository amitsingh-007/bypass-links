import { parseBookmarksPanelUrl, ROUTES } from '@bypass/shared';
import { Route, useSearch } from 'wouter';

import BookmarksPanel from '../components/BookmarksPanel';

function BookmarksPanelWrapper() {
  const search = useSearch();

  return <BookmarksPanel {...parseBookmarksPanelUrl(search)} />;
}

export const BookmarksPanelRoute = (
  <Route path={ROUTES.BOOKMARK_PANEL} component={BookmarksPanelWrapper} />
);
