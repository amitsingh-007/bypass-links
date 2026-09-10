import type { ContextBookmarks } from '@bypass/shared';

export const processBookmarksMove = (
  destinationIndex: number,
  cutBookmarks: Set<string>,
  contextBookmarks: ContextBookmarks
) => {
  const movedBeforeDestination = contextBookmarks.filter(
    (bookmark, index) =>
      index < destinationIndex && cutBookmarks.has(bookmark.id)
  ).length;
  // Cut rows above the target are gone from the list the moved block lands in,
  // so the target's index shifts down by all but one of them
  const destIndex =
    movedBeforeDestination === 0
      ? destinationIndex
      : destinationIndex - movedBeforeDestination + 1;

  const moved = contextBookmarks.filter(({ id }) => cutBookmarks.has(id));
  const rest = contextBookmarks.filter(({ id }) => !cutBookmarks.has(id));
  rest.splice(destIndex, 0, ...moved);

  return {
    newContextBookmarks: rest,
    newSelectedBookmarks: new Set(moved.map(({ id }) => id)),
  };
};
