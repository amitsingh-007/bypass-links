import { IRedirection } from '@bypass/shared';
import {
  Active,
  DndContextProps,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useCallback, useState } from 'react';

interface Props {
  redirections: IRedirection[];
  saveRedirectionTemp: (redirections: IRedirection[]) => void;
}

const useShortcutDrag = ({ redirections, saveRedirectionTemp }: Props) => {
  const [draggingNode, setDraggingNode] = useState<Active>();
  const sensors = useSensors(useSensor(PointerSensor));

  const onDragStart = useCallback<NonNullable<DndContextProps['onDragStart']>>(
    ({ active }) => setDraggingNode(active),
    []
  );

  const onDragEnd = useCallback<NonNullable<DndContextProps['onDragEnd']>>(
    ({ active, over }) => {
      if (!over || active.id === over.id) {
        return;
      }
      const sourceIndex = active.data.current?.sortable?.index;
      const destIndex = over.data.current?.sortable?.index;
      const newRedirections = Array.from(redirections);
      const draggedRedirection = redirections[sourceIndex];
      newRedirections.splice(sourceIndex, 1);
      newRedirections.splice(destIndex, 0, draggedRedirection);
      saveRedirectionTemp(newRedirections);
    },
    [redirections, saveRedirectionTemp]
  );

  const onDragCancel = useCallback(() => setDraggingNode(undefined), []);

  return {
    sensors,
    draggingNode,
    onDragStart,
    onDragEnd,
    onDragCancel,
  };
};

export default useShortcutDrag;
