import { Box } from '@mui/material';
import { memo } from 'react';
import { areEqual } from 'react-window';
import {
  ContextBookmarks,
  IBookmarksObj,
} from '@common/components/Bookmarks/interfaces';
import { isFolderEmpty } from '@common/components/Bookmarks/utils';
import Bookmark from '@common/components/Bookmarks/components/Bookmark';
import Folder from '@common/components/Bookmarks/components/Folder';
import styles from './VirtualRow.module.scss';

export interface VirtualRowProps {
  folders: IBookmarksObj['folders'];
  contextBookmarks: ContextBookmarks;
}

const VirtualRow = memo<{
  index: number;
  style: React.CSSProperties;
  data: VirtualRowProps;
}>(({ index, style, data: innerProps }) => {
  const { folders, contextBookmarks } = innerProps;
  const {
    url = '',
    title = '',
    name = '',
    taggedPersons = [],
    isDir,
  } = contextBookmarks[index];

  const onOpenLink = (url: string) => {
    window.open(url, '_blank')?.open();
  };

  return (
    <Box style={style} className={styles.bookmarkRowContainer}>
      {isDir ? (
        <Folder name={name} isEmpty={isFolderEmpty(folders, name)} />
      ) : (
        <Bookmark
          url={url}
          title={title}
          taggedPersons={taggedPersons}
          onOpenLink={onOpenLink}
        />
      )}
    </Box>
  );
}, areEqual);
VirtualRow.displayName = 'VirtualRow';

export default VirtualRow;
