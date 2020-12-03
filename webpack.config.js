const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundleAnalyzerPlugin = require("@bundle-analyzer/webpack-plugin");
const WebpackBundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const FileManagerPlugin = require("filemanager-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const WebpackShellPluginNext = require("webpack-shell-plugin-next");
const webpack = require("webpack");
const { getExtensionFile } = require("./src/utils");
const { getReleaseConfig } = require("./release-config");

const ENV = process.env.NODE_ENV || "production";
const isProduction = ENV === "production";
const enableBundleAnalyzer = process.env.ENABLE_BUNDLE_ANLYZER === "true";

const releaseConfig = getReleaseConfig();

const preactConfig = {
  alias: {
    react: "preact/compat",
    "react-dom": "preact/compat",
  },
};

const devToolsConfig = isProduction
  ? undefined
  : "eval-cheap-module-source-map";

const fileManagerPluginConfig = new FileManagerPlugin({
  events: {
    onStart: {
      copy: [
        {
          source: "./public-extension/*",
          destination: path.resolve(__dirname, "extension"),
        },
      ],
    },
    onEnd: {
      archive: [
        {
          source: path.resolve(__dirname, "extension"),
          destination: `./build/${getExtensionFile(
            releaseConfig.__EXT_VERSION__
          )}`,
        },
      ],
    },
  },
});

const getPopupConfigPlugins = () => {
  const plugins = [
    new HtmlWebpackPlugin({
      template: "./public-extension/index.html",
      cache: false,
    }),
    new BundleAnalyzerPlugin({
      token: "9bc57954116cf0bd136f7718b24d79c4383ff15f",
    }),
    fileManagerPluginConfig,
  ];
  return plugins;
};

const getDownloadPageConfigPlugins = () => {
  const plugins = [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      cache: false,
    }),
    new BundleAnalyzerPlugin({
      token: "9bc57954116cf0bd136f7718b24d79c4383ff15f",
    }),
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({ ...releaseConfig }),
  ];
  if (!isProduction) {
    plugins.push(
      new WebpackShellPluginNext({
        onBuildEnd: ["nodemon server/index.js --watch extension"],
      })
    );
  }
  return plugins;
};

const getBackgroundConfigPlugins = () => {
  const plugins = [
    new FileManagerPlugin({
      events: {
        onStart: {
          copy: [
            {
              source: "./src/css/*",
              destination: path.resolve(__dirname, "extension"),
            },
          ],
        },
      },
    }),
    new BundleAnalyzerPlugin({
      token: "9bc57954116cf0bd136f7718b24d79c4383ff15f",
    }),
    fileManagerPluginConfig,
  ];
  if (enableBundleAnalyzer) {
    plugins.push(
      new WebpackBundleAnalyzerPlugin({
        openAnalyzer: true,
        generateStatsFile: true,
        statsFilename: "stats.json",
        defaultSizes: "gzip",
      })
    );
  }
  return plugins;
};

const downloadPageConfig = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "gh-pages.js",
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.svg/,
        use: {
          loader: "svg-url-loader",
        },
      },
    ],
  },
  mode: ENV,
  resolve: preactConfig,
  plugins: getDownloadPageConfigPlugins(),
  devtool: devToolsConfig,
};

const backgroundConfig = {
  entry: "./src/scripts/background.js",
  output: {
    path: path.resolve(__dirname, "extension"),
    filename: "background.js",
  },
  mode: ENV,
  resolve: preactConfig,
  plugins: getBackgroundConfigPlugins(),
  devtool: devToolsConfig,
};

const popupConfig = {
  entry: "./src/PopupApp.js",
  output: {
    path: path.resolve(__dirname, "extension"),
    filename: "popup.js",
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  mode: ENV,
  resolve: preactConfig,
  plugins: getPopupConfigPlugins(),
  devtool: devToolsConfig,
};

module.exports = [downloadPageConfig, backgroundConfig, popupConfig];
