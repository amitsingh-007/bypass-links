export const getCurrentTab = async () => {
  const [currentTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  return currentTab;
};
