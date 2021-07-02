const path = require("path");
const withPWA = require("next-pwa");
const { releaseDate } = require("./scripts/release-config");
const { extVersion } = require("../common/src/scripts/extension-version");

// next-pwa options
const pwaConfig = {
  pwa: {
    swSrc: "./scripts/sw.js",
    dest: "public",
  },
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
};

const nextConfig = {
  ...pwaConfig,
  // nextJS options
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    config.plugins.push(
      new webpack.DefinePlugin({
        __PROD__: JSON.stringify(!dev),
        __EXT_VERSION__: JSON.stringify(extVersion),
        __RELEASE_DATE__: JSON.stringify(releaseDate),
        HOST_NAME: JSON.stringify(
          dev ? "http://localhost:3000" : "https://bypass-links.vercel.app"
        ),
        __SERVER__: JSON.stringify(isServer),
      })
    );
    // https://github.com/firebase/firebase-admin-node/issues/84
    config.externals.push("firebase-admin");
    return config;
  },
  reactStrictMode: true,
  // https://docs.netlify.com/configure-builds/common-configurations/next-js/#edit-next-config-js
  target: "serverless",
};

module.exports = withPWA(nextConfig);
