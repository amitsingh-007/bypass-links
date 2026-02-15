/**
 * Handles keyboard events to prevent Escape key from propagating to parent elements.
 * Useful for modal dialogs to prevent closing the extension popup when closing the modal.
 */
export const handleEscapeKey = (e: React.KeyboardEvent) => {
  if (e.key === 'Escape') {
    e.stopPropagation();
    e.preventDefault();
  }
};
