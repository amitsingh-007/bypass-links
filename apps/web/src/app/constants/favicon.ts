export const getFaviconUrl = (url: string) =>
  `https://favicon.yandex.net/favicon/${new URL(url).hostname}`;
