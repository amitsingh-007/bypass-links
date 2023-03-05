export const getCurrentTab = async () => {
  const [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  return currentTab;
};
