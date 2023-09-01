export const getFaviconUrl = (url: string) =>
  `https://www.google.com/s2/favicons?sz=64&domain_url=${url}`;

export const getFaviconProxyUrl = (url: string) =>
  `${HOST_NAME}/api/favicon?url=${new URL(url).origin}`;

export const noOp = () => undefined;
