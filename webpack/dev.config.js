const HtmlWebpackPlugin = require("html-webpack-plugin");
const FileManagerPlugin = require("filemanager-webpack-plugin");
const { InjectManifest } = require("workbox-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { DefinePlugin, DllReferencePlugin } = require("webpack");
const { releaseDate, extVersion } = require("../release-config");
const { commonConfig, PATHS } = require("./common.config");
const firebasedDllConfig = require("./firebase.config");

const ENV = process.env.NODE_ENV;
const isDevServer = process.env.DEV_SERVER === "true";

const miniCssExtractPlugin = new MiniCssExtractPlugin({
  filename: "[name].[contenthash].css",
  chunkFilename: "[id].[contenthash].css",
});

const dllReferencePlugin = new DllReferencePlugin({
  name: "firebase_lib",
  manifest: `${PATHS.FIREBASE_BUILD}/firebase-manifest.json`,
});

const definePlugin = new DefinePlugin({
  __EXT_VERSION__: JSON.stringify(extVersion),
  __RELEASE_DATE__: JSON.stringify(releaseDate),
  __PROD__: JSON.stringify(false),
});

const downloadPageConfig = {
  ...commonConfig,
  entry: "./src/index.js",
  output: {
    path: PATHS.BUILD,
    filename: "js/[name].[chunkhash:9].js",
    chunkFilename: "js/[name].[chunkhash:9].js",
    pathinfo: false,
  },
  //Due to bug in WebpackV5: https://github.com/webpack/webpack-dev-server/issues/2758
  target: "web",
  devServer: {
    contentBase: PATHS.BUILD,
    compress: true,
    port: 5000,
    open: true,
    stats: "errors-warnings",
    watchContentBase: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      cache: false,
      favicon: "./assets/bypass_link_on_128.png",
    }),
    new FileManagerPlugin({
      events: {
        onStart: {
          delete: ["./build/*"],
        },
        onEnd: {
          copy: [
            {
              source: "./public/!(index.html)", //copy everything except index.html
              destination: PATHS.BUILD,
            },
          ],
        },
      },
    }),
    new InjectManifest({
      swSrc: "./src/sw.js",
      swDest: "sw.js",
    }),
    definePlugin,
    miniCssExtractPlugin,
  ],
  devtool: "source-map",
};

const backgroundConfig = {
  ...commonConfig,
  entry: "./src/scripts/background.js",
  output: {
    path: PATHS.EXTENSION,
    filename: "background.js",
  },
  target: "browserslist",
  optimization: {
    nodeEnv: ENV,
    minimize: false,
  },
  plugins: [
    new FileManagerPlugin({
      events: {
        onStart: {
          copy: [
            {
              source: `${PATHS.FIREBASE_BUILD}/firebase.js`,
              destination: `${PATHS.EXTENSION}/`,
            },
          ],
        },
      },
    }),
    dllReferencePlugin,
    definePlugin,
  ],
};

const popupConfig = {
  ...commonConfig,
  entry: "./src/popupIndex.js",
  output: {
    path: PATHS.EXTENSION,
    filename: "js/[name].[chunkhash:9].js",
    chunkFilename: "js/[name].[chunkhash:9].js",
    pathinfo: false,
  },
  target: "browserslist",
  plugins: [
    new HtmlWebpackPlugin({
      template: "./assets/index.html",
      inject: false,
      cache: false,
    }),
    new FileManagerPlugin({
      events: {
        onStart: {
          copy: [
            {
              source: "./assets/*",
              destination: PATHS.EXTENSION,
            },
          ],
        },
      },
    }),
    dllReferencePlugin,
    miniCssExtractPlugin,
    definePlugin,
  ],
};

const configs = isDevServer
  ? [downloadPageConfig]
  : [firebasedDllConfig, backgroundConfig, popupConfig];

module.exports = configs;
