/* eslint-disable @typescript-eslint/no-empty-function */
export const getFaviconProxyUrl = (url: string) =>
  `https://favicon.yandex.net/favicon/${new URL(url).hostname}`;

export const noOp = () => {};
export const asyncNoOp = async () => {};

export const sleep = async (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
