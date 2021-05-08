import tabs from "ChromeApi/tabs";
import {
  bypassLinkvertiseUsingExternalApi,
  fetchLinkMetaData,
  fetchTargetUrl,
} from "GlobalApis/linkvertise";
import { BYPASS_KEYS } from "GlobalConstants/index";
import { matchHostnames } from "GlobalUtils/common";

const getDynamicParams = (url) => ({
  type: "dynamic",
  userId: url.pathname.split("/")[1],
  target: url.searchParams.get("r"),
});

const getStaticParams = (url) => {
  const [, userId, target] = url.pathname.split("/");
  return {
    type: "static",
    userId,
    target,
  };
};

export const bypassLinkvertise = async (url, tabId) => {
  const isDynamicType = url.pathname.includes("dynamic");
  const { type, userId, target } = isDynamicType
    ? getDynamicParams(url)
    : getStaticParams(url);
  const { linkId, linkUrl } = await fetchLinkMetaData(type, userId, target);
  let targetUrl = await fetchTargetUrl(userId, linkId, linkUrl);
  const targetUrlObj = new URL(targetUrl);
  const isLinkvetiseDownloadPage = await matchHostnames(
    targetUrlObj.hostname,
    BYPASS_KEYS.LINKVERTISE_DOWNLOAD
  );
  if (isLinkvetiseDownloadPage) {
    targetUrl = await bypassLinkvertiseUsingExternalApi(url);
  }
  await tabs.update(tabId, { url: targetUrl });
};
