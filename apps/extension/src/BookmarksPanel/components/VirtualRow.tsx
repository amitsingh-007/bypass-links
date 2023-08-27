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
import { areEqual } from 'react-window';
import BookmarkRow from './BookmarkRow';
import FolderRow, { Props as FolderProps } from './FolderRow';

export interface VirtualRowProps {
  folderNamesList: string[];
  folders: IBookmarksObj['folders'];
  selectedBookmarks: ISelectedBookmarks;
  contextBookmarks: ContextBookmarks;
  handleFolderRemove: FolderProps['handleRemove'];
  handleFolderEdit: FolderProps['handleEdit'];
  resetSelectedBookmarks: FolderProps['resetSelectedBookmarks'];
  handleSelectedChange: BookmarkProps['handleSelectedChange'];
}

const VirtualRow = memo<{
  index: number;
  style: React.CSSProperties;
  data: VirtualRowProps;
}>(({ index, style, data: innerProps }) => {
  const {
    folders,
    selectedBookmarks,
    contextBookmarks,
    handleFolderRemove,
    handleFolderEdit,
    resetSelectedBookmarks,
    handleSelectedChange,
  } = innerProps;
  const ctx = contextBookmarks[index];
  const id = getBookmarkId(ctx);

  const { transition, listeners, setNodeRef, attributes, containerStyles } =
    useDndSortable(id);

  const isSelected = Boolean(selectedBookmarks[index]);
  return (
    <Box
      style={{ ...style, transition }}
      sx={[
        containerStyles,
        // Added to fix context menu
        { zIndex: ctx.isDir ? 1 : 'auto' },
      ]}
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
}, areEqual);
VirtualRow.displayName = 'VirtualRow';

export default VirtualRow;
