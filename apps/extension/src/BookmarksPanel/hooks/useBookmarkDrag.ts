import { ISelectedBookmarks } from '@bypass/shared';
import {
  DndContextProps,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';

interface Props {
  setSelectedBookmarks: Dispatch<SetStateAction<ISelectedBookmarks>>;
  handleMoveBookmarks: (destinationIndex: number) => void;
}

const useBookmarkDrag = ({
  setSelectedBookmarks,
  handleMoveBookmarks,
}: Props) => {
  const [isDragging, setIsDragging] = useState(false);
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
      const index = active.data.current?.sortable?.index;
      setSelectedBookmarks((prev) => {
        const newValue = [...prev];
        const isCurrentDraggingSelected = newValue[index];
        if (!isCurrentDraggingSelected) {
          newValue.fill(false);
          newValue[index] = true;
        }
        return newValue;
      });
      setIsDragging(true);
    },
    [setSelectedBookmarks]
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
