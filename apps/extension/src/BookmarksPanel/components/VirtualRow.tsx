import {
  BookmarkProps,
  ContextBookmarks,
  IBookmarksObj,
  ISelectedBookmarks,
  isFolderEmpty,
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
  return (
    <Box style={style}>
      {ctx.isDir ? (
        <FolderRow
          pos={index}
          isDir={ctx.isDir}
          name={ctx.name}
          handleRemove={handleFolderRemove}
          handleEdit={handleFolderEdit}
          isEmpty={isFolderEmpty(folders, ctx.name)}
          resetSelectedBookmarks={resetSelectedBookmarks}
        />
      ) : (
        <BookmarkRow
          pos={index}
          isDir={ctx.isDir}
          url={ctx.url}
          title={ctx.title}
          taggedPersons={ctx.taggedPersons}
          isSelected={Boolean(selectedBookmarks[index])}
          handleSelectedChange={handleSelectedChange}
        />
      )}
    </Box>
  );
}, areEqual);
VirtualRow.displayName = 'VirtualRow';

export default VirtualRow;
