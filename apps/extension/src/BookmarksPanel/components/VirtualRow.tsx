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
  const {
    url = '',
    title = '',
    name = '',
    taggedPersons = [],
    isDir,
  } = contextBookmarks[index];
  return (
    <Box style={style}>
      {isDir ? (
        <FolderRow
          pos={index}
          isDir={isDir}
          name={name}
          handleRemove={handleFolderRemove}
          handleEdit={handleFolderEdit}
          isEmpty={isFolderEmpty(folders, name)}
          resetSelectedBookmarks={resetSelectedBookmarks}
        />
      ) : (
        <BookmarkRow
          pos={index}
          isDir={isDir}
          url={url}
          title={title}
          taggedPersons={taggedPersons}
          isSelected={Boolean(selectedBookmarks[index])}
          handleSelectedChange={handleSelectedChange}
        />
      )}
    </Box>
  );
}, areEqual);
VirtualRow.displayName = 'VirtualRow';

export default VirtualRow;
