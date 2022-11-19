import Bookmark, {
  Props,
} from '@common/components/Bookmarks/components/Bookmark';
import { memo } from 'react';
import withBookmarkRow from '../hoc/withBookmarkRow';
import tabs from 'GlobalHelpers/chrome/tabs';
import { startHistoryMonitor } from 'SrcPath/HistoryPanel/actionCreators';
import { useDispatch } from 'react-redux';

const BookmarkRow = memo<Omit<Props, 'onOpenLink'>>((props) => {
  const dispatch = useDispatch();

  const onOpenLink = (url: string) => {
    dispatch(startHistoryMonitor());
    tabs.create({ url, selected: false });
  };

  return <Bookmark {...props} onOpenLink={onOpenLink} />;
});
BookmarkRow.displayName = 'BookmarkRow';

export type { Props };
export default withBookmarkRow(BookmarkRow);
