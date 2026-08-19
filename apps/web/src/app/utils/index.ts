export const openNewTab = (url: string) => {
  // `noopener` makes window.open return null by spec, so there is no handle to focus
  window.open(url, '_blank', 'noopener,noreferrer');
};
