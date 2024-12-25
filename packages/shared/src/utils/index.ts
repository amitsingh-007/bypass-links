export const getFaviconProxyUrl = (url: string) =>
  `https://favicon.yandex.net/favicon/${new URL(url).hostname}`;

export const noOp = () => {};
