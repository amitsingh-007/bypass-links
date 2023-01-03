const LINKVERTISE_API_BASE_URL =
  'https://publisher.linkvertise.com/api/v1/redirect/link';

export const fetchLinkMetaData = async (
  type: string,
  userId: string,
  target: string
): Promise<{
  linkId: string;
  linkUrl: string;
}> => {
  const apiUrl = `${LINKVERTISE_API_BASE_URL}/${type}/${userId}/${target}`;
  const res = await fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => data);
  const { id, url } = res.data.link;
  return {
    linkId: id,
    linkUrl: url,
  };
};

const getParams = (linkId: string) => {
  const params = {
    serial: btoa(
      JSON.stringify({
        timestamp: new Date().getTime(),
        random: '6548307',
        link_id: linkId,
      })
    ),
  };
  return params;
};

export const fetchTargetUrl = async (
  userId: string,
  linkId: string,
  linkUrl: string
): Promise<string> => {
  const params = getParams(linkId);
  const apiUrl = `${LINKVERTISE_API_BASE_URL}/${userId}/${linkUrl}/target`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(params),
  })
    .then((response) => response.json())
    .then((data) => data);
  return response.data.target;
};

export const bypassLinkvertiseUsingExternalFallbackApi = async (
  urlObj: URL
): Promise<string> => {
  const apiUrl = `https://bypass.bot.nu/bypass2?url=${urlObj.href}`;
  const response = await fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => data);
  return response.destination;
};

export const bypassLinkvertiseUsingExternalApi = async (
  urlObj: URL
): Promise<string> => {
  const apiUrl = `https://api.bypass.vip/`;
  const data = new URLSearchParams({ url: urlObj.href });
  const result = await fetch(apiUrl, {
    method: 'POST',
    body: data,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
  });
  const response = await result.json();
  return response.response?.substring(11);
};
