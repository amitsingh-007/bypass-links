import {
  ContextBookmarks,
  ISelectedBookmarks,
  bookmarkRowStyles,
  noOp,
} from '@bypass/shared';
import { Box, Center, Text } from '@mantine/core';
import FolderRow from './FolderRow';
import BookmarkRow from './BookmarkRow';
import { getSelectedCount } from '../utils';

const DragClone: React.FC<{
  selectedBookmarks: ISelectedBookmarks;
  contextBookmarks: ContextBookmarks;
}> = ({ selectedBookmarks, contextBookmarks }) => {
  const dragCount = getSelectedCount(selectedBookmarks);

  if (dragCount > 1) {
    return (
      <Center
        w="100%"
        h="100%"
        py="0.125rem"
        sx={bookmarkRowStyles}
        data-is-dragging="true"
      >
        <Text size={15}>{`Currently dragging: ${dragCount} item`}</Text>
      </Center>
    );
  }

  const selectedIndex = selectedBookmarks.findIndex(Boolean);
  const ctx = contextBookmarks[selectedIndex];
  return (
    <Box h="100%" sx={bookmarkRowStyles} data-is-selected>
      {ctx.isDir ? (
        <FolderRow
          pos={selectedIndex}
          name={ctx.name}
          handleRemove={noOp}
          handleEdit={noOp}
          isEmpty={false}
          resetSelectedBookmarks={noOp}
        />
      ) : (
        <BookmarkRow
          pos={selectedIndex}
          url={ctx.url}
          title={ctx.title}
          taggedPersons={ctx.taggedPersons}
          isSelected
          handleSelectedChange={noOp}
        />
      )}
    </Box>
  );
};

export default DragClone;
