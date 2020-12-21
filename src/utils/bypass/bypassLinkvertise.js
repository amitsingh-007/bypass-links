import tabs from "ChromeApi/tabs";
import { fetchLinkMetaData, fetchTargetUrl } from "GlobalApis/linkvertise";

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
  const targetUrl = await fetchTargetUrl(userId, linkId, linkUrl);
  await tabs.update(tabId, { url: targetUrl });
};
