import {
  DndContextProps,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useCallback, useState } from 'react';
import useBookmarkStore from '../store/useBookmarkStore';

const useBookmarkDrag = () => {
  const [isDragging, setIsDragging] = useState(false);
  const handleMoveBookmarks = useBookmarkStore(
    (state) => state.handleMoveBookmarks
  );
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    })
  );

  const onDragStart = useCallback<NonNullable<DndContextProps['onDragStart']>>(
    ({ active }) => {
      const { selectedBookmarks } = useBookmarkStore.getState();
      const index = active.data.current?.sortable?.index;
      const newSelectedBookmarks = [...selectedBookmarks];
      const isCurrentDraggingSelected = newSelectedBookmarks[index];
      if (!isCurrentDraggingSelected) {
        newSelectedBookmarks.fill(false);
        newSelectedBookmarks[index] = true;
      }
      useBookmarkStore.setState({ selectedBookmarks: newSelectedBookmarks });
      setIsDragging(true);
    },
    []
  );

  const onDragEnd = useCallback<NonNullable<DndContextProps['onDragEnd']>>(
    ({ active, over }) => {
      if (!over || active.id === over.id) {
        return;
      }
      handleMoveBookmarks(over.data.current?.sortable?.index);
      setIsDragging(false);
    },
    [handleMoveBookmarks]
  );

  const onDragCancel = useCallback(() => setIsDragging(false), []);

  return {
    sensors,
    isDragging,
    onDragStart,
    onDragEnd,
    onDragCancel,
  };
};

export default useBookmarkDrag;
