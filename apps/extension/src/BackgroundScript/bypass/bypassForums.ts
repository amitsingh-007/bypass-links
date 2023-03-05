export const bypassForums = async (url: URL, tabId: number) => {
  const encodedRedirectUrl = url.searchParams.get('to');
  if (encodedRedirectUrl) {
    const redirectUrl = atob(encodedRedirectUrl);
    await chrome.tabs.remove(tabId);
    chrome.tabs.create({ url: redirectUrl });
  }
};
