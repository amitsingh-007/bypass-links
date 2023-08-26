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
import { Box } from '@mantine/core';
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
  } = useSortable({
    id,
  });

  useEffect(() => {
    if (!isDragging) {
      return undefined;
    }
    document.body.style.cursor = 'grabbing';

    return () => {
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  const wrapperClass = {
    transform:
      'translate3d(var(--translate-x, 0), var(--translate-y, 0), 0) scaleX(var(--scale-x, 1)) scaleY(var(--scale-y, 1))',
    transformOrigin: '0 0',
    touchAction: 'manipulation',
  };

  const dragOverlayClass = isDragging
    ? {
        '--scale': 1.05,
        '--box-shadow':
          '0 0 0 calc(1px / var(--scale-x, 1)) rgba(63, 63, 68, 0.05), 0 1px calc(3px / var(--scale-x, 1)) 0 rgba(34, 33, 81, 0.15)',
        '--box-shadow-picked-up':
          '0 0 0 calc(1px / var(--scale-x, 1)) rgba(63, 63, 68, 0.05), -1px 0 15px 0 rgba(34, 33, 81, 0.01), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)',
        opacity: 'var(--dragging-opacity, 0.75)',
        zIndex: -1,
      }
    : {};

  const isSelected = Boolean(selectedBookmarks[index]);

  return (
    <Box
      style={
        {
          ...style,
          transition,
          '--translate-x': transform
            ? `${Math.round(transform.x)}px`
            : undefined,
          '--translate-y': transform
            ? `${Math.round(transform.y)}px`
            : undefined,
          '--scale-x': transform?.scaleX ? `${transform.scaleX}` : undefined,
          '--scale-y': transform?.scaleY ? `${transform.scaleY}` : undefined,
          '--index': index,
        } as React.CSSProperties
      }
      sx={{
        ...wrapperClass,
        ...dragOverlayClass,
        userSelect: 'none',
        cursor: 'pointer',
      }}
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
