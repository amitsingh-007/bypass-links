import { ExpirationPlugin } from "workbox-expiration";
import { registerRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";

self.skipWaiting();

/**
 * NOTE: Cant use precacheAndRoute cuz it uses CacheFirst strategy, so we get old page on load
 * Cant remove below line, otherwise webpack throws error
 * Refer: https://github.com/GoogleChrome/workbox/issues/2253
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const manifest = self.__WB_MANIFEST;

//Cache all GET request excluding apis
registerRoute(
  /^((?!api).)*\/$/,
  new NetworkFirst({
    cacheName: "document-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 1,
      }),
    ],
  })
);

//Cache all assets required on the page
registerRoute(
  /\.*\.(png|svg|html|js|css)$/,
  new NetworkFirst({
    cacheName: "document-assets-cache",
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }),
    ],
  })
);

//Cache extension zip file
registerRoute(
  /bypass-links-.*\.zip/,
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
  /.*\/(manifest\.webmanifest\.json|bypass_link_[192,512]\.png)/,
  new NetworkFirst({
    cacheName: "a2hs-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 1,
      }),
    ],
  })
);
