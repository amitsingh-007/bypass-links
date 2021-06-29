const path = require("path");
const { releaseDate, extVersion } = require("./scripts/release-config");
const withPWA = require("next-pwa");

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
    return config;
  },
};

module.exports = withPWA(nextConfig);
