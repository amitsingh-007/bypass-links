import tabs from '@helpers/chrome/tabs';

export const bypassBonsai = async (url: URL, tabId: number) => {
  const encodedTargetUrl = url.searchParams.get('adsurlkkk');
  if (encodedTargetUrl) {
    await tabs.update(tabId, { url: atob(encodedTargetUrl) });
  }
};
