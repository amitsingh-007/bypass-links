/** Items absent from the map sort last, hence the -1 sentinel. */
export const sortByPriority = <T>(
  items: T[],
  keyOf: (item: T) => string,
  priority: Record<string, number>
) =>
  items.toSorted(
    (a, b) => (priority[keyOf(b)] ?? -1) - (priority[keyOf(a)] ?? -1)
  );
