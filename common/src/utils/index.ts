export const getFaviconUrl = (url: string) =>
  `https://www.google.com/s2/favicons?sz=64&domain_url=${new URL(url).origin}`;
