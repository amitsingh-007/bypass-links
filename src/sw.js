/* eslint-disable no-restricted-globals */
import { ExpirationPlugin } from "workbox-expiration";
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";

self.skipWaiting();

//Cache build time assets(html, js, css)
precacheAndRoute(self.__WB_MANIFEST);

//Cache extension zip file
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

//Cache fonts
registerRoute(
  /https:\/\/fonts\.gstatic.com\/.*\.woff2/,
  new NetworkFirst({
    cacheName: "fonts-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 1,
      }),
    ],
  })
);

//Cache AddToHomeScreen assets
registerRoute(
  /manifest\.webmanifest\.json|bypass_link_512\.png|bypass_link_192\.png/,
  new NetworkFirst({
    cacheName: "A2HS-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 1,
      }),
    ],
  })
);
