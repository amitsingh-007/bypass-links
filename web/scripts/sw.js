/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
self.skipWaiting();

/**
 * NOTE: Cant use precacheAndRoute cuz it uses CacheFirst strategy, so we get old page on load
 * Cant remove below line, otherwise webpack throws error
 * Refer: https://github.com/GoogleChrome/workbox/issues/2253
 */
const manifest = self.__WB_MANIFEST;

self.addEventListener('fetch', function (_event) {
  //Listening for A2HS
});
