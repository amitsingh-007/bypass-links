import { Box } from '@mui/material';
import { memo } from 'react';
import { areEqual } from 'react-window';
import {
  ContextBookmarks,
  IBookmarksObj,
} from '@bypass/shared/components/Bookmarks/interfaces';
import { isFolderEmpty } from '@bypass/shared/components/Bookmarks/utils';
import Bookmark from '@bypass/shared/components/Bookmarks/components/Bookmark';
import Folder from '@bypass/shared/components/Bookmarks/components/Folder';
import styles from './VirtualRow.module.scss';
import { openNewTab } from '@/ui/utils';

export interface VirtualRowProps {
  folders: IBookmarksObj['folders'];
  contextBookmarks: ContextBookmarks;
}

const rowStyles = {
  paddingLeft: '12px',
  paddingRight: '9px',
};

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
    openNewTab(url);
  };

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        ...style,
      }}
      className={styles.bookmarkRowContainer}
    >
      {isDir ? (
        <Folder
          name={name}
          isEmpty={isFolderEmpty(folders, name)}
          containerStyles={rowStyles}
        />
      ) : (
        <Bookmark
          url={url}
          title={title}
          taggedPersons={taggedPersons}
          onOpenLink={onOpenLink}
          containerStyles={rowStyles}
        />
      )}
    </Box>
  );
}, areEqual);
VirtualRow.displayName = 'VirtualRow';

export default VirtualRow;
