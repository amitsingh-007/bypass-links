import { LINKVERTISE_BASE_URL } from "../constants";

export const bypassLinkvertise = async (url) => {
  const isDynamicType = url.pathname.includes("dynamic");
  const { type, userId, target } = isDynamicType
    ? getDynamicParams(url)
    : getStaticParams(url);
  const { linkId, linkUrl } = await fetchLinkMetaData(type, userId, target);
  return await fetchTargetUrl(userId, linkId, linkUrl);
};

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

const fetchLinkMetaData = async (type, userId, target) => {
  const apiUrl = `${LINKVERTISE_BASE_URL}/${type}/${userId}/${target}`;
  const res = await fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => data);
  const { id, url } = res.data.link;
  return { linkId: id, linkUrl: url };
};

const fetchTargetUrl = async (userId, linkId, linkUrl) => {
  const qs = getParams(linkId);
  const apiUrl = `${LINKVERTISE_BASE_URL}/${userId}/${linkUrl}/target?${qs}`;
  const response = await fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => data);
  return response.data.target;
};

const getParams = (linkId) => {
  const params = {
    serial: btoa(
      JSON.stringify({
        timestamp: new Date().getTime(),
        random: "6548307",
        link_id: linkId,
      })
    ),
  };
  return new URLSearchParams(params).toString();
};
