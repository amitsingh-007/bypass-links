const HtmlWebpackPlugin = require("html-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const FileManagerPlugin = require("filemanager-webpack-plugin");
const { InjectManifest } = require("workbox-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const { DefinePlugin, DllReferencePlugin } = require("webpack");
const { getExtensionFile } = require("../src/utils/downloadPage");
const { releaseDate, extVersion } = require("../release-config");
const { commonConfig, PATHS } = require("./common.config");
const firebasedDllConfig = require("./firebase.config");

const ENV = process.env.NODE_ENV;
const enableBundleAnalyzer = process.env.ENABLE_BUNDLE_ANLYZER === "true";

const miniCssExtractPlugin = new MiniCssExtractPlugin({
  filename: "[name].[contenthash].css",
  chunkFilename: "[id].[contenthash].css",
});

const dllReferencePlugin = new DllReferencePlugin({
  name: "firebase_lib",
  manifest: `${PATHS.FIREBASE_BUILD}/firebase-manifest.json`,
});

const getWebpackBundleAnalyzerPlugin = (port) =>
  new BundleAnalyzerPlugin({
    openAnalyzer: true,
    generateStatsFile: true,
    statsFilename: "stats.json",
    defaultSizes: "gzip",
    analyzerPort: port,
  });

const definePlugin = new DefinePlugin({
  __EXT_VERSION__: JSON.stringify(extVersion),
  __RELEASE_DATE__: JSON.stringify(releaseDate),
  __PROD__: JSON.stringify(true),
});

const getDownloadPageConfigPlugins = () => {
  const plugins = [
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
    new OptimizeCssAssetsPlugin({}),
    definePlugin,
    miniCssExtractPlugin,
  ];
  if (enableBundleAnalyzer) {
    plugins.push(getWebpackBundleAnalyzerPlugin(8888));
  }
  return plugins;
};

const getPopupConfigPlugins = () => {
  const plugins = [
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
        onEnd: {
          delete: ["./extension/js/*.txt"],
          archive: [
            {
              source: PATHS.EXTENSION,
              destination: `${PATHS.BUILD}/${getExtensionFile(extVersion)}`,
            },
          ],
        },
      },
    }),
    new OptimizeCssAssetsPlugin({}),
    dllReferencePlugin,
    miniCssExtractPlugin,
    definePlugin,
  ];
  if (enableBundleAnalyzer) {
    plugins.push(getWebpackBundleAnalyzerPlugin(8889));
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
              source: `${PATHS.FIREBASE_BUILD}/firebase.js`,
              destination: `${PATHS.EXTENSION}/`,
            },
          ],
        },
      },
    }),
    dllReferencePlugin,
    definePlugin,
  ];
  if (enableBundleAnalyzer) {
    plugins.push(getWebpackBundleAnalyzerPlugin(8890));
  }
  return plugins;
};

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
  target: "browserslist",
  plugins: getDownloadPageConfigPlugins(),
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
  plugins: getBackgroundConfigPlugins(),
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
  plugins: getPopupConfigPlugins(),
};

//Following order matters
module.exports = [
  downloadPageConfig,
  firebasedDllConfig,
  backgroundConfig,
  popupConfig,
];
