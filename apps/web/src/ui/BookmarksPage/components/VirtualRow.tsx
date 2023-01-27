import { openNewTab } from '@/ui/utils';
import {
  Bookmark,
  bookmarkRowStyles,
  ContextBookmarks,
  Folder,
  IBookmarksObj,
  isFolderEmpty,
} from '@bypass/shared';
import { Flex } from '@mantine/core';
import { memo } from 'react';
import { areEqual } from 'react-window';

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
  const ctx = contextBookmarks[index];

  const onOpenLink = (_url: string) => {
    openNewTab(_url);
  };

  return (
    <Flex
      sx={[{ cursor: 'pointer', userSelect: 'none' }, bookmarkRowStyles]}
      style={style}
    >
      {ctx.isDir ? (
        <Folder name={ctx.name} isEmpty={isFolderEmpty(folders, ctx.name)} />
      ) : (
        <Bookmark
          url={ctx.url}
          title={ctx.title}
          taggedPersons={ctx.taggedPersons}
          onOpenLink={onOpenLink}
        />
      )}
    </Flex>
  );
}, areEqual);
VirtualRow.displayName = 'VirtualRow';

export default VirtualRow;
