import {
  Bookmark,
  getGoogleFaviconUrl,
  type BookmarkProps,
} from '@bypass/shared';
import useHistoryStore from '@store/history';
import { memo } from 'react';

const BookmarkRow = memo<Omit<BookmarkProps, 'onOpenLink' | 'getFaviconUrl'>>(
  (props) => {
    const startHistoryMonitor = useHistoryStore(
      (state) => state.startHistoryMonitor
    );

    const onOpenLink = (url: string) => {
      startHistoryMonitor();
      browser.tabs.create({ url, active: false });
    };

    return (
      <Bookmark
        {...props}
        getFaviconUrl={getGoogleFaviconUrl}
        onOpenLink={onOpenLink}
      />
    );
  }
);

export default BookmarkRow;
