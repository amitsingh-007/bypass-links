import { ContextBookmarks, ISelectedBookmarks } from '@bypass/shared';

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
  const { draggedBookmarks, notDraggedBookmarks } = bookmarks.reduce<{
    draggedBookmarks: ContextBookmarks;
    notDraggedBookmarks: ContextBookmarks;
  }>(
    (output, bookmark, index) => {
      if (selectedBookmarks[index]) {
        output.draggedBookmarks.push(bookmark);
      } else {
        output.notDraggedBookmarks.push(bookmark);
      }
      return output;
    },
    { draggedBookmarks: [], notDraggedBookmarks: [] }
  );
  notDraggedBookmarks.splice(destIndex, 0, ...draggedBookmarks);
  return notDraggedBookmarks;
};

const getSelectedBookmarksAfterDrag = (
  selectedBookmarks: ISelectedBookmarks,
  destIndex: number
) => {
  const selectedBookmarksCount = selectedBookmarks.filter(Boolean).length;
  const selectedBookmarksInNewOrder = selectedBookmarks.fill(false);
  for (let i = destIndex; i < destIndex + selectedBookmarksCount; i++) {
    selectedBookmarksInNewOrder[i] = true;
  }
  return [...selectedBookmarksInNewOrder];
};

/**
 * This is called for both moving to top/bottom and pasting
 */
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
