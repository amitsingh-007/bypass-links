import {
  Bookmark,
  getGoogleFaviconUrl,
  type BookmarkProps,
} from '@bypass/shared';
import useHistoryStore from '@store/history';

function BookmarkRow(
  props: Omit<BookmarkProps, 'onOpenLink' | 'getFaviconUrl'>
) {
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

export default BookmarkRow;
