import scripting from "GlobalHelpers/chrome/scripting";
import tabs from "GlobalHelpers/chrome/tabs";
import windows from "GlobalHelpers/chrome/windows";
import { MEDIUM_HOMEPAGE, MEDIUM_WHITELISTED } from "GlobalConstants";

const shouldSkipBypassingMedium = (url, searchParams) =>
  url === MEDIUM_HOMEPAGE ||
  MEDIUM_WHITELISTED.find((link) => url.includes(link)) ||
  searchParams.get("source");

const shouldBypass = () => {
  return {
    hasPaywall: !!document.getElementById("paywall-background-color"),
  };
};

export const bypassMedium = async (url, tabId) => {
  if (shouldSkipBypassingMedium(url.href, url.searchParams)) {
    return;
  }

  const [{ result }] = await scripting.executeScript({
    target: { tabId },
    function: shouldBypass,
  });
  if (result && result.hasPaywall) {
    await windows.create({
      url: url.href,
      state: "maximized",
      incognito: true,
    });
    tabs.goBack(tabId);
  }
};
