const { merge } = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const FileManagerPlugin = require("filemanager-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { DllReferencePlugin } = require("webpack");
const WatchExternalFilesPlugin = require("webpack-watch-external-files-plugin");
const commonConfig = require("./common.config");
const { extVersion } = require("../../common/src/scripts/extension-version");
const { PATHS } = require("./constants");

const ENV = process.env.NODE_ENV;
const isProduction = ENV === "production";

const dllReferencePlugin = new DllReferencePlugin({
  context: PATHS.ROOT,
  manifest: `${PATHS.FIREBASE}/manifest.json`,
});

const getPopupFileManagerPlugin = () => {
  const config = {
    events: {
      onStart: {
        copy: [
          {
            source: "./assets",
            destination: `${PATHS.EXTENSION}/assets`,
          },
          {
            source: "./public/*",
            destination: PATHS.EXTENSION,
          },
        ],
      },
    },
  };
  if (isProduction) {
    config.events.onEnd = {
      archive: [
        {
          source: PATHS.EXTENSION,
          destination: `${PATHS.EXTENSION}/${`bypass-links-${extVersion}.zip`}`,
        },
      ],
    };
  }
  return new FileManagerPlugin(config);
};

const getBackgroundConfigPlugins = () => {
  const plugins = [
    new FileManagerPlugin({
      events: {
        onStart: {
          copy: [
            {
              source: `${PATHS.SRC}/BackgroundScript/service-worker.js`,
              destination: `${PATHS.EXTENSION}/`,
            },
          ],
        },
      },
    }),
    dllReferencePlugin,
  ];
  return plugins;
};

const getPopupConfigPlugins = () => {
  const plugins = [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      inject: false,
      cache: false,
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].[contenthash].css",
      chunkFilename: "css/[id].[contenthash].css",
    }),
    new WatchExternalFilesPlugin({
      files: ["./public/*"],
    }),
    getPopupFileManagerPlugin(),
    dllReferencePlugin,
  ];
  return plugins;
};

const backgroundConfig = merge(commonConfig, {
  name: "background-script",
  entry: "./src/BackgroundScript/index.ts",
  output: {
    path: PATHS.EXTENSION,
    filename: "js/background.js",
  },
  plugins: getBackgroundConfigPlugins(),
});

const popupConfig = merge(commonConfig, {
  name: "content-script",
  entry: "./src/index.tsx",
  output: {
    path: PATHS.EXTENSION,
    filename: "js/[name].[chunkhash:9].js",
    chunkFilename: "js/[name].[chunkhash:9].js",
  },
  plugins: getPopupConfigPlugins(),
});

module.exports = [backgroundConfig, popupConfig];
