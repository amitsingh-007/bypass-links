import { openNewTab } from '@/ui/utils';
import {
  Bookmark,
  ContextBookmarks,
  Folder,
  IBookmarksObj,
  isFolderEmpty,
} from '@bypass/shared';
import bookmarkRowStyles from '@bypass/shared/styles/bookmarks/styles.module.css';
import { Flex } from '@mantine/core';
import clsx from 'clsx';
import { memo } from 'react';
import styles from './styles/VirtualRow.module.css';

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
      h="100%"
      className={clsx(bookmarkRowStyles.bookmarkRow, styles.bookmarkWrapper)}
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
