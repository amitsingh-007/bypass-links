import { ContextBookmarks, ISelectedBookmarks, noOp } from '@bypass/shared';
import bookmarkRowStyles from '@bypass/shared/styles/bookmarks/styles.module.css';
import { Box, Center, Text } from '@mantine/core';
import { getSelectedCount } from '../utils';
import BookmarkRow from './BookmarkRow';
import FolderRow from './FolderRow';

interface Props {
  selectedBookmarks: ISelectedBookmarks;
  contextBookmarks: ContextBookmarks;
}

const DragClone = ({ selectedBookmarks, contextBookmarks }: Props) => {
  const dragCount = getSelectedCount(selectedBookmarks);

  if (dragCount > 1) {
    return (
      <Center
        w="100%"
        h="100%"
        py="0.125rem"
        className={bookmarkRowStyles.bookmarkRow}
        data-is-dragging="true"
      >
        <Text size="15px">{`Currently dragging: ${dragCount} item`}</Text>
      </Center>
    );
  }

  const selectedIndex = selectedBookmarks.findIndex(Boolean);
  const ctx = contextBookmarks[selectedIndex];
  return (
    <Box h="100%" className={bookmarkRowStyles.bookmarkRow} data-is-selected>
      {ctx.isDir ? (
        <FolderRow
          pos={selectedIndex}
          name={ctx.name}
          isDefault={ctx.isDefault}
          handleRemove={noOp}
          handleEdit={noOp}
          isEmpty={false}
          resetSelectedBookmarks={noOp}
          toggleDefaultFolder={noOp}
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
