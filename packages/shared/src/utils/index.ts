export const getFaviconProxyUrl = (url: string) =>
  `https://favicon.yandex.net/favicon/${new URL(url).hostname}`;

export const noOp = () => {};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
