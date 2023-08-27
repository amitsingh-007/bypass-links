import {
  BookmarkProps,
  ContextBookmarks,
  IBookmarksObj,
  ISelectedBookmarks,
  bookmarkRowStyles,
  getBookmarkId,
  isFolderEmpty,
} from '@bypass/shared';
import { useSortable } from '@dnd-kit/sortable';
import { Transform } from '@dnd-kit/utilities';
import { Box, CSSObject } from '@mantine/core';
import { memo, useEffect } from 'react';
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

const getContainerStyles = (
  isDragging: boolean,
  transform: Transform | null
) => {
  const styles: CSSObject = {
    transform: `translate3d(${Math.round(transform?.x ?? 0)}px, ${Math.round(
      transform?.y ?? 0
    )}px, 0) scaleX(${transform?.scaleX ?? 1}) scaleY(${
      transform?.scaleY ?? 1
    })`,
    transformOrigin: '0 0',
    touchAction: 'manipulation',
    userSelect: 'none',
    cursor: 'pointer',
  };
  if (isDragging) {
    styles.opacity = 0.6;
    styles.zIndex = -1;
  }
  return styles;
};

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

  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  useEffect(() => {
    if (!isDragging) {
      return undefined;
    }
    document.body.style.cursor = 'grabbing';
    return () => {
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  const isSelected = Boolean(selectedBookmarks[index]);
  return (
    <Box
      style={{ ...style, transition }}
      sx={[
        getContainerStyles(isDragging, transform),
        // Added to fix context menu
        { zIndex: ctx.isDir ? 1 : 'auto' },
      ]}
      ref={setNodeRef}
      data-index={index}
      data-id={id}
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
