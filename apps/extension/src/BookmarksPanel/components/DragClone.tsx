import { bookmarkRowStyles } from '@bypass/shared';
import { DraggableProvided } from '@hello-pangea/dnd';
import { Center, Text } from '@mantine/core';

const DragClone: React.FC<{
  provided: DraggableProvided;
  dragCount: number;
}> = ({ provided, dragCount }) => (
  <Center
    w="100%"
    h="100%"
    py="0.125rem"
    sx={bookmarkRowStyles}
    data-is-dragging="true"
    ref={provided.innerRef}
    {...provided.draggableProps}
    {...provided.dragHandleProps}
  >
    <Text size={15}>{`Currently dragging: ${dragCount} item`}</Text>
  </Center>
);

export default DragClone;
