import {
  ContextBookmark,
  getBookmarkId,
  isFolderEmpty,
  useDndSortable,
} from '@bypass/shared';
import bookmarkRowStyles from '@bypass/shared/styles/bookmarks/styles.module.css';
import { Box } from '@mantine/core';
import { memo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import useBookmarkStore from '../store/useBookmarkStore';
import BookmarkRow from './BookmarkRow';
import FolderRow from './FolderRow';

export interface Props {
  bookmark: ContextBookmark;
  pos: number;
  isSelected: boolean;
}

const VirtualRow = memo<Props>(function VirtualRow({
  bookmark,
  pos,
  isSelected,
}) {
  const id = getBookmarkId(bookmark);
  const {
    folders,
    handleFolderRemove,
    handleFolderRename,
    handleToggleDefaultFolder,
    resetSelectedBookmarks,
    handleSelectedChange,
  } = useBookmarkStore(
    useShallow((state) => ({
      folders: state.folders,
      handleFolderRemove: state.handleFolderRemove,
      handleFolderRename: state.handleFolderRename,
      handleToggleDefaultFolder: state.handleToggleDefaultFolder,
      resetSelectedBookmarks: state.resetSelectedBookmarks,
      handleSelectedChange: state.handleSelectedChange,
    }))
  );
  const { listeners, setNodeRef, attributes, containerStyles } =
    useDndSortable(id);

  return (
    <Box
      style={{
        ...containerStyles,
        // Added to fix context menu
        zIndex: bookmark.isDir ? 1 : 'auto',
      }}
      h="100%"
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      tabIndex={0}
    >
      <Box
        h="100%"
        className={bookmarkRowStyles.bookmarkRow}
        data-is-selected={isSelected}
      >
        {bookmark.isDir ? (
          <FolderRow
            pos={pos}
            name={bookmark.name}
            isDefault={bookmark.isDefault}
            handleRemove={handleFolderRemove}
            handleEdit={handleFolderRename}
            toggleDefaultFolder={handleToggleDefaultFolder}
            isEmpty={isFolderEmpty(folders, bookmark.name)}
            resetSelectedBookmarks={resetSelectedBookmarks}
          />
        ) : (
          <BookmarkRow
            pos={pos}
            url={bookmark.url}
            title={bookmark.title}
            taggedPersons={bookmark.taggedPersons}
            isSelected={isSelected}
            handleSelectedChange={handleSelectedChange}
          />
        )}
      </Box>
    </Box>
  );
});

export default VirtualRow;
