/* eslint-disable no-restricted-globals */
import { ExpirationPlugin } from "workbox-expiration";
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";

self.skipWaiting();
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  /.*(bypass-links-.*).*\.zip$/,
  new NetworkFirst({
    cacheName: "extension-file-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 1,
      }),
    ],
  })
);
