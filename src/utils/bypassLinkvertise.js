import { fetchLinkMetaData, fetchTargetUrl } from "../apis/linkvertise";
import { HOSTNAME } from "../constants";
import { changeTabUrl } from "./changeTabUrl";

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
  if (url.hostname !== HOSTNAME.LINKVERTISE) {
    return;
  }
  const isDynamicType = url.pathname.includes("dynamic");
  const { type, userId, target } = isDynamicType
    ? getDynamicParams(url)
    : getStaticParams(url);
  const { linkId, linkUrl } = await fetchLinkMetaData(type, userId, target);
  const targetUrl = await fetchTargetUrl(userId, linkId, linkUrl);
  await changeTabUrl(tabId, targetUrl);
};
