import type { ContextBookmarks, ISelectedBookmarks } from '@bypass/shared';

import { countTruthy } from '.';

const getDestinationIndex = (
  destIndex: number,
  selectedBookmarks: ISelectedBookmarks
) => {
  const draggedBookmarksBeforeDestIndex = selectedBookmarks.filter(
    (isSelected, index) => isSelected && index < destIndex
  ).length;
  return draggedBookmarksBeforeDestIndex === 0
    ? destIndex
    : destIndex - draggedBookmarksBeforeDestIndex + 1;
};

const getBookmarksAfterDrag = (
  bookmarks: ContextBookmarks,
  selectedBookmarks: ISelectedBookmarks,
  destIndex: number
) => {
  const draggedBookmarks = bookmarks.filter(
    (_, index) => selectedBookmarks[index]
  );
  const notDraggedBookmarks = bookmarks.filter(
    (_, index) => !selectedBookmarks[index]
  );
  notDraggedBookmarks.splice(destIndex, 0, ...draggedBookmarks);
  return notDraggedBookmarks;
};

const getSelectedBookmarksAfterDrag = (
  selectedBookmarks: ISelectedBookmarks,
  destIndex: number
) => {
  const selectedBookmarksCount = countTruthy(selectedBookmarks);
  const selectedBookmarksInNewOrder = selectedBookmarks.fill(false);
  for (let i = destIndex; i < destIndex + selectedBookmarksCount; i++) {
    selectedBookmarksInNewOrder[i] = true;
  }
  return [...selectedBookmarksInNewOrder];
};

export const processBookmarksMove = (
  destinationIndex: number,
  selectedBookmarks: ISelectedBookmarks,
  contextBookmarks: ContextBookmarks
) => {
  const destIndex = getDestinationIndex(destinationIndex, selectedBookmarks);
  const newContextBookmarks = getBookmarksAfterDrag(
    contextBookmarks,
    selectedBookmarks,
    destIndex
  );
  const newSelectedBookmarks = getSelectedBookmarksAfterDrag(
    [...selectedBookmarks],
    destIndex
  );

  return {
    newContextBookmarks,
    newSelectedBookmarks,
  };
};
