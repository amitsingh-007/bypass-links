import { type ContextBookmark, isFolderEmpty } from '@bypass/shared';
import bookmarkRowStyles from '@bypass/shared/styles/bookmarks/styles.module.css';
import { Box } from '@mantine/core';
import { useShallow } from 'zustand/react/shallow';
import clsx from 'clsx';
import useBookmarkStore from '../store/useBookmarkStore';
import BookmarkRow from './BookmarkRow';
import FolderRow from './FolderRow';
import styles from './styles/VirtualRow.module.css';

export interface Props {
  bookmark: ContextBookmark;
  pos: number;
  isSelected: boolean;
  isCut: boolean;
}

function VirtualRow({ bookmark, pos, isSelected, isCut }: Props) {
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

  return (
    <Box
      h="100%"
      className={clsx(bookmarkRowStyles.bookmarkRow, styles.container)}
      // Added to fix context menu
      style={{ zIndex: bookmark.isDir ? 1 : 'auto' }}
      data-is-selected={isSelected}
      data-is-cut={isCut}
    >
      {bookmark.isDir ? (
        <FolderRow
          id={bookmark.id}
          pos={pos}
          name={bookmark.name}
          isDefault={bookmark.isDefault}
          handleRemove={handleFolderRemove}
          handleEdit={handleFolderRename}
          toggleDefaultFolder={handleToggleDefaultFolder}
          isEmpty={isFolderEmpty(folders, bookmark.id)}
          resetSelectedBookmarks={resetSelectedBookmarks}
        />
      ) : (
        <BookmarkRow
          id={bookmark.id}
          pos={pos}
          url={bookmark.url}
          title={bookmark.title}
          taggedPersons={bookmark.taggedPersons}
          isSelected={isSelected}
          handleSelectedChange={handleSelectedChange}
        />
      )}
    </Box>
  );
}

export default VirtualRow;
