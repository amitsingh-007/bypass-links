export const hasText = (searchText: string, text?: string) =>
  text?.toLowerCase().includes(searchText.toLowerCase()) ?? false;

/** An empty search matches everything, so callers can filter unconditionally. */
export const matchesSearch = (
  searchText: string,
  ...fields: (string | undefined)[]
) => !searchText || fields.some((field) => hasText(searchText, field));
