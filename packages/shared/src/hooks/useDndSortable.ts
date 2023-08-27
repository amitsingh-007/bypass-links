import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { Transform } from '@dnd-kit/utilities';
import { CSSObject } from '@mantine/styles';
import { useEffect } from 'react';

const getContainerStyles = (
  isDragging: boolean,
  transform: Transform | null
) => {
  const styles: CSSObject = {
    transform: `translate3d(${Math.round(transform?.x ?? 0)}px, ${Math.round(
      transform?.y ?? 0
    )}px, 0) scaleX(${transform?.scaleX ?? 1}) scaleY(${
      transform?.scaleY ?? 1
    })`,
    transformOrigin: '0 0',
    touchAction: 'manipulation',
    userSelect: 'none',
    cursor: 'pointer',
  };
  if (isDragging) {
    styles.opacity = 0.6;
    styles.zIndex = -1;
  }
  return styles;
};

const useDndSortable = (id: UniqueIdentifier) => {
  const sortable = useSortable({ id });
  const { isDragging, transform } = sortable;

  useEffect(() => {
    if (!isDragging) {
      return undefined;
    }
    document.body.style.cursor = 'grabbing';
    return () => {
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  return {
    ...sortable,
    containerStyles: getContainerStyles(isDragging, transform),
  };
};

export default useDndSortable;
