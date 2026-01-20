import { openNewTab } from '@app/utils';
import {
  Bookmark,
  type ContextBookmarks,
  Folder,
  type IBookmarksObj,
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

const onOpenLink = (_url: string) => {
  openNewTab(_url);
};

const VirtualRow = memo<Props>(({ index, folders, contextBookmarks }) => {
  const ctx = contextBookmarks[index];

  return (
    <Flex
      h="100%"
      className={clsx(bookmarkRowStyles.bookmarkRow, styles.bookmarkWrapper)}
    >
      {ctx.isDir ? (
        <Folder name={ctx.name} isEmpty={isFolderEmpty(folders, ctx.name)} />
      ) : (
        <Bookmark
          id={ctx.id}
          url={ctx.url}
          title={ctx.title}
          taggedPersons={ctx.taggedPersons}
          onOpenLink={onOpenLink}
        />
      )}
    </Flex>
  );
});

export default VirtualRow;
