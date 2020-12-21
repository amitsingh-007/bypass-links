export const bypassForums = async (url, tabId) => {
  const encodedRedirectUrl = url.searchParams.get("to");
  const redirectUrl = encodedRedirectUrl && atob(encodedRedirectUrl);
  if (redirectUrl) {
    chrome.tabs.remove(tabId, () => {
      chrome.tabs.create({ url: redirectUrl });
    });
  }
};
