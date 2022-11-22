import { Box } from '@mui/material';
import { memo } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { bookmarkRowStyles } from '@common/components/Bookmarks/constants';
import '@common/components/Bookmarks/scss/BookmarkRow.scss';

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
            className="bookmarkRowContainer"
            sx={{
              height: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            ref={provided.innerRef as React.Ref<unknown>}
            data-is-selected={isSelected}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <Component {...props} containerStyles={bookmarkRowStyles} />
          </Box>
        )}
      </Draggable>
    );
  });

export default withBookmarkRow;
