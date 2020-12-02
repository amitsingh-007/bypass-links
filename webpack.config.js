const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundleAnalyzerPlugin = require("@bundle-analyzer/webpack-plugin");
const WebpackBundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const FileManagerPlugin = require("filemanager-webpack-plugin");
const WebpackShellPluginNext = require("webpack-shell-plugin-next");
const { getExtensionFile } = require("./src/utils");
const manifest = require("./public-extension/manifest.json");

const ENV = process.env.NODE_ENV || "production";
const isProduction = ENV === "production";
const ENABLE_BUNDLE_ANLYZER = process.env.ENABLE_BUNDLE_ANLYZER === "true";

const preactConfig = {
  alias: {
    react: "preact/compat",
    "react-dom": "preact/compat",
  },
};

const getPopupConfigPlugins = (isProduction) => {
  const plugins = [
    new HtmlWebpackPlugin({
      template: "./public-extension/index.html",
      cache: false,
    }),
    new BundleAnalyzerPlugin({
      token: "9bc57954116cf0bd136f7718b24d79c4383ff15f",
    }),
    new FileManagerPlugin({
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
              destination: `./build/${getExtensionFile(manifest.version)}`,
            },
          ],
        },
      },
    }),
  ];
  return plugins;
};

const getDownloadPageConfigPlugins = (isProduction) => {
  const plugins = [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      cache: false,
    }),
    new BundleAnalyzerPlugin({
      token: "9bc57954116cf0bd136f7718b24d79c4383ff15f",
    }),
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

const getBackgroundConfigPlugins = (enableBundleAnalyzer) => {
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
        test: /\.(js|jsx)$/,
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
  plugins: getDownloadPageConfigPlugins(isProduction),
  devtool: isProduction ? undefined : "eval-cheap-module-source-map",
};

const backgroundConfig = {
  entry: "./src/scripts/background.js",
  output: {
    path: path.resolve(__dirname, "extension"),
    filename: "background.js",
  },
  mode: ENV,
  resolve: preactConfig,
  plugins: getBackgroundConfigPlugins(ENABLE_BUNDLE_ANLYZER),
  devtool: isProduction ? undefined : "eval-cheap-module-source-map",
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
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  mode: ENV,
  resolve: preactConfig,
  plugins: getPopupConfigPlugins(isProduction),
  devtool: isProduction ? undefined : "eval-cheap-module-source-map",
};

module.exports = [downloadPageConfig, backgroundConfig, popupConfig];
