import { ContextBookmarks, ISelectedBookmarks } from '../interfaces';

export const getDestinationIndex = (
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

export const getBookmarksAfterDrag = (
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

export const getSelectedBookmarksAfterDrag = (
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
