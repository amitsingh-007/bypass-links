import type { ContextBookmarks } from '@bypass/shared';

export const processBookmarksMove = (
  destinationIndex: number,
  cutBookmarks: Set<string>,
  contextBookmarks: ContextBookmarks
) => {
  const movedBookmarks = contextBookmarks.filter(({ id }) =>
    cutBookmarks.has(id)
  );
  const remainingBookmarks = contextBookmarks.filter(
    ({ id }) => !cutBookmarks.has(id)
  );
  const movedAboveDestination = contextBookmarks
    .slice(0, destinationIndex)
    .filter(({ id }) => cutBookmarks.has(id)).length;
  // Cut rows above the target shift its index down by all but one of them
  const insertionIndex =
    movedAboveDestination === 0
      ? destinationIndex
      : destinationIndex - movedAboveDestination + 1;

  remainingBookmarks.splice(insertionIndex, 0, ...movedBookmarks);
  const newContextBookmarks = remainingBookmarks;
  const newSelectedBookmarks = new Set(movedBookmarks.map(({ id }) => id));

  return { newContextBookmarks, newSelectedBookmarks };
};
