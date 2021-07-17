import tabs from "GlobalHelpers/chrome/tabs";

export const bypassForums = async (url, tabId) => {
  const encodedRedirectUrl = url.searchParams.get("to");
  const redirectUrl = encodedRedirectUrl && atob(encodedRedirectUrl);
  if (redirectUrl) {
    await tabs.remove(tabId);
    tabs.create({ url: redirectUrl });
  }
};
