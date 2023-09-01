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

export interface Props {
  index: number;
  folders: IBookmarksObj['folders'];
  contextBookmarks: ContextBookmarks;
}

const VirtualRow = memo<Props>(({ index, folders, contextBookmarks }) => {
  const ctx = contextBookmarks[index];

  const onOpenLink = (_url: string) => {
    openNewTab(_url);
  };

  return (
    <Flex
      sx={[{ cursor: 'pointer', userSelect: 'none' }, bookmarkRowStyles]}
      h="100%"
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
});
VirtualRow.displayName = 'VirtualRow';

export default VirtualRow;
