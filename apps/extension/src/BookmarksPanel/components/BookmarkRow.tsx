import { Bookmark, BookmarkProps } from '@bypass/shared';
import useHistoryStore from '@store/history';
import { memo } from 'react';
import withBookmarkRow from '../hoc/withBookmarkRow';

const BookmarkRow = memo<Omit<BookmarkProps, 'onOpenLink'>>((props) => {
  const startHistoryMonitor = useHistoryStore(
    (state) => state.startHistoryMonitor
  );

  const onOpenLink = (url: string) => {
    startHistoryMonitor();
    chrome.tabs.create({ url, active: false });
  };

  return <Bookmark {...props} onOpenLink={onOpenLink} />;
});
BookmarkRow.displayName = 'BookmarkRow';

export default withBookmarkRow(BookmarkRow);
