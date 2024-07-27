export const getFaviconProxyUrl = (url: string) =>
  `${HOST_NAME}/api/favicon?url=${new URL(url).origin}`;

export const noOp = () => {};
