import { openNewTab } from '@/ui/utils';
import Bookmark from '@bypass/shared/components/Bookmarks/components/Bookmark';
import Folder from '@bypass/shared/components/Bookmarks/components/Folder';
import { bookmarkRowStyles } from '@bypass/shared/components/Bookmarks/constants/styles';
import {
  ContextBookmarks,
  IBookmarksObj,
} from '@bypass/shared/components/Bookmarks/interfaces';
import { isFolderEmpty } from '@bypass/shared/components/Bookmarks/utils';
import { Flex } from '@mantine/core';
import { memo } from 'react';
import { areEqual } from 'react-window';

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
    <Flex
      sx={[{ cursor: 'pointer', userSelect: 'none' }, bookmarkRowStyles]}
      style={style}
    >
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
    </Flex>
  );
}, areEqual);
VirtualRow.displayName = 'VirtualRow';

export default VirtualRow;
