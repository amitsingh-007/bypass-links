import { bookmarkRowStyles } from '@bypass/shared/components/Bookmarks/constants/styles';
import '@bypass/shared/components/Bookmarks/scss/BookmarkRow.scss';
import { Draggable } from '@hello-pangea/dnd';
import { Box } from '@mantine/core';
import { memo } from 'react';

interface ExpectedProps {
  isDir: boolean;
  pos: number;
  name?: string;
  url?: string;
  title?: string;
  isSelected?: boolean;
}

const withBookmarkRow = <T extends object>(Component: React.ComponentType<T>) =>
  memo<T & ExpectedProps>(function BookmarkRowHoc(props) {
    const { isDir, name, url, pos, isSelected } = props;
    const primaryUniqueId = (isDir ? name : url) || '';

    return (
      <Draggable draggableId={primaryUniqueId} index={pos}>
        {(provided) => (
          <Box
            h="100%"
            sx={bookmarkRowStyles}
            ref={provided.innerRef}
            data-is-selected={isSelected}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <Component {...props} />
          </Box>
        )}
      </Draggable>
    );
  });

export default withBookmarkRow;
