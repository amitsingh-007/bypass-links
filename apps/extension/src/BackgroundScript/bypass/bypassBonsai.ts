export const bypassBonsai = async (url: URL, tabId: number) => {
  const encodedTargetUrl = url.searchParams.get('adsurlkkk');
  if (encodedTargetUrl) {
    await chrome.tabs.update(tabId, { url: atob(encodedTargetUrl) });
  }
};
