export const hasText = (searchText: string, text?: string) =>
  text?.toLowerCase().includes(searchText.toLowerCase()) ?? false;

export const matchesText = (
  searchText: string,
  ...texts: (string | undefined)[]
) => texts.some((text) => hasText(searchText, text));
