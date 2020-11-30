export const changeTabUrl = async (tabId, targetUrl) => {
  if (targetUrl) {
    console.log(`Changing tab url to ${targetUrl}`);
    targetUrl && chrome.tabs.update(tabId, { url: targetUrl });
  }
};
