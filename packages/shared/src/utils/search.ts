export const hasText = (searchText: string, text?: string) =>
  text?.toLowerCase().includes(searchText.toLowerCase()) ?? false;
