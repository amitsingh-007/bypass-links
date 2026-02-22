/* eslint-disable @typescript-eslint/no-empty-function */
export const getGoogleFaviconUrl = (url: string) =>
  `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`;

export const getYandexFaviconUrl = (url: string) =>
  `https://favicon.yandex.net/favicon/${new URL(url).hostname}`;

export const noOp = () => {};
export const asyncNoOp = async () => {};

export const sleep = async (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
