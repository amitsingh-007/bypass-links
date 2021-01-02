import tabs from "ChromeApi/tabs";
import windows from "ChromeApi/windows";
import { MEDIUM_HOMEPAGE, MEDIUM_WHITELISTED } from "GlobalConstants/index";

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

  const [result] = await tabs.executeScript(tabId, {
    code: `(${shouldBypass})()`,
    runAt: "document_end",
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
