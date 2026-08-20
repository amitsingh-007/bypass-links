/** Escape must not reach the popup root, which would close the extension popup. */
export const handleEscapeKey = (e: React.KeyboardEvent) => {
  if (e.key === 'Escape') {
    e.stopPropagation();
    e.preventDefault();
  }
};
