import tabs from '@helpers/chrome/tabs';

export const bypassForums = async (url: URL, tabId: number) => {
  const encodedRedirectUrl = url.searchParams.get('to');
  if (encodedRedirectUrl) {
    const redirectUrl = atob(encodedRedirectUrl);
    await tabs.remove(tabId);
    tabs.create({ url: redirectUrl });
  }
};
