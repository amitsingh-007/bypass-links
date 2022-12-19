import Bookmark, {
  Props,
} from '@bypass/shared/components/Bookmarks/components/Bookmark';
import { memo } from 'react';
import withBookmarkRow from '../hoc/withBookmarkRow';
import tabs from 'GlobalHelpers/chrome/tabs';
import useHistoryStore from 'GlobalStore/history';

const BookmarkRow = memo<Omit<Props, 'onOpenLink'>>((props) => {
  const startHistoryMonitor = useHistoryStore(
    (state) => state.startHistoryMonitor
  );

  const onOpenLink = (url: string) => {
    startHistoryMonitor();
    tabs.create({ url, active: false });
  };

  return <Bookmark {...props} onOpenLink={onOpenLink} />;
});
BookmarkRow.displayName = 'BookmarkRow';

export type { Props };
export default withBookmarkRow(BookmarkRow);
