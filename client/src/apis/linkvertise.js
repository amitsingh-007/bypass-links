import { LINKVERTISE_API_BASE_URL } from "GlobalConstants/index";

export const fetchLinkMetaData = async (type, userId, target) => {
  const apiUrl = `${LINKVERTISE_API_BASE_URL}/${type}/${userId}/${target}`;
  const res = await fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => data);
  const { id, url } = res.data.link;
  return { linkId: id, linkUrl: url };
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
  return params;
};

export const fetchTargetUrl = async (userId, linkId, linkUrl) => {
  const params = getParams(linkId);
  const apiUrl = `${LINKVERTISE_API_BASE_URL}/${userId}/${linkUrl}/target`;
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(params),
  })
    .then((response) => response.json())
    .then((data) => data);
  return response.data.target;
};
