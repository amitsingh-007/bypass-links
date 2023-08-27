import {
  BookmarkProps,
  ContextBookmarks,
  IBookmarksObj,
  ISelectedBookmarks,
  bookmarkRowStyles,
  getBookmarkId,
  isFolderEmpty,
  useDndSortable,
} from '@bypass/shared';
import { Box } from '@mantine/core';
import { memo } from 'react';
import BookmarkRow from './BookmarkRow';
import FolderRow, { Props as FolderProps } from './FolderRow';

export interface VirtualRowProps {
  index: number;
  folderNamesList: string[];
  folders: IBookmarksObj['folders'];
  selectedBookmarks: ISelectedBookmarks;
  contextBookmarks: ContextBookmarks;
  handleFolderRemove: FolderProps['handleRemove'];
  handleFolderEdit: FolderProps['handleEdit'];
  resetSelectedBookmarks: FolderProps['resetSelectedBookmarks'];
  handleSelectedChange: BookmarkProps['handleSelectedChange'];
}

const VirtualRow = memo<VirtualRowProps>(function VirtualRow({
  index,
  folders,
  selectedBookmarks,
  contextBookmarks,
  handleFolderRemove,
  handleFolderEdit,
  resetSelectedBookmarks,
  handleSelectedChange,
}) {
  const ctx = contextBookmarks[index];
  const id = getBookmarkId(ctx);

  const { listeners, setNodeRef, attributes, containerStyles } =
    useDndSortable(id);

  const isSelected = Boolean(selectedBookmarks[index]);
  return (
    <Box
      sx={[
        containerStyles,
        // Added to fix context menu
        { zIndex: ctx.isDir ? 1 : 'auto' },
      ]}
      h="100%"
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      tabIndex={0}
    >
      <Box h="100%" sx={bookmarkRowStyles} data-is-selected={isSelected}>
        {ctx.isDir ? (
          <FolderRow
            pos={index}
            name={ctx.name}
            handleRemove={handleFolderRemove}
            handleEdit={handleFolderEdit}
            isEmpty={isFolderEmpty(folders, ctx.name)}
            resetSelectedBookmarks={resetSelectedBookmarks}
          />
        ) : (
          <BookmarkRow
            pos={index}
            url={ctx.url}
            title={ctx.title}
            taggedPersons={ctx.taggedPersons}
            isSelected={isSelected}
            handleSelectedChange={handleSelectedChange}
          />
        )}
      </Box>
    </Box>
  );
});

export default VirtualRow;
