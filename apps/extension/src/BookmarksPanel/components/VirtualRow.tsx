import {
  BookmarkProps,
  ContextBookmark,
  IBookmarksObj,
  getBookmarkId,
  isFolderEmpty,
  useDndSortable,
} from '@bypass/shared';
import bookmarkRowStyles from '@bypass/shared/styles/bookmarks/styles.module.css';
import { Box } from '@mantine/core';
import { memo } from 'react';
import BookmarkRow from './BookmarkRow';
import FolderRow, { Props as FolderProps } from './FolderRow';

export interface Props {
  bookmark: ContextBookmark;
  pos: number;
  folders: IBookmarksObj['folders'];
  isSelected: boolean;
  handleFolderRemove: FolderProps['handleRemove'];
  handleFolderEdit: FolderProps['handleEdit'];
  toggleDefaultFolder: (
    folder: string,
    isDefault: boolean,
    pos: number
  ) => void;
  resetSelectedBookmarks: FolderProps['resetSelectedBookmarks'];
  handleSelectedChange: BookmarkProps['handleSelectedChange'];
}

const VirtualRow = memo<Props>(function VirtualRow({
  bookmark,
  pos,
  folders,
  isSelected,
  handleFolderRemove,
  handleFolderEdit,
  toggleDefaultFolder,
  resetSelectedBookmarks,
  handleSelectedChange,
}) {
  const id = getBookmarkId(bookmark);
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
            handleEdit={handleFolderEdit}
            toggleDefaultFolder={toggleDefaultFolder}
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
