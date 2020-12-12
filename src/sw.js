import { ExpirationPlugin } from "workbox-expiration";
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";

self.skipWaiting();
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  /.*/,
  new StaleWhileRevalidate({
    cacheName: "bypass-links-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
      }),
    ],
  })
);
