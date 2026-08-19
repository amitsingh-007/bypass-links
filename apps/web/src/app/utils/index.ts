export const openNewTab = (url: string) => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (!newWindow) {
    console.error(`Could not open a new tab for ${url}`);
    return;
  }
  newWindow.focus();
};
