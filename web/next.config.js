const webpack = require("webpack");

module.exports = {
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        __PROD__: JSON.stringify(!dev),
      })
    );
    return config;
  },
};
