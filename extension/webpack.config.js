const HtmlWebpackPlugin = require("html-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const FileManagerPlugin = require("filemanager-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { DefinePlugin, DllReferencePlugin } = require("webpack");
const { commonConfig, PATHS } = require("./webpack.common.config");
const firebaseDllConfig = require("./webpack.firebase.config");
const WatchExternalFilesPlugin = require("webpack-watch-external-files-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const { extVersion } = require("../common/src/scripts/extension-version");

const ENV = process.env.NODE_ENV;
const isProduction = ENV === "production";
const enableBundleAnalyzer = process.env.ENABLE_BUNDLE_ANLYZER === "true";
const hostName = process.env.HOST_NAME;

const esLintPLugin = new ESLintPlugin({});

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
  __PROD__: JSON.stringify(isProduction),
  HOST_NAME: JSON.stringify(hostName),
});

const getPopupFileManagerPlugin = () => {
  const config = {
    events: {
      onStart: {
        copy: [
          {
            source: "./assets/!(index.html|manifest.json)",
            destination: `${PATHS.EXTENSION}/assets/`,
          },
          {
            source: "./assets/(index.html|manifest.json)",
            destination: PATHS.EXTENSION,
          },
        ],
      },
    },
  };
  if (isProduction) {
    config.events.onEnd = {
      delete: ["./extension/js/*.txt"],
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

const getPopupConfigPlugins = () => {
  const plugins = [
    new HtmlWebpackPlugin({
      template: "./assets/index.html",
      inject: false,
      cache: false,
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].[contenthash].css",
      chunkFilename: "css/[id].[contenthash].css",
    }),
    getPopupFileManagerPlugin(),
    dllReferencePlugin,
    definePlugin,
    esLintPLugin,
  ];
  if (enableBundleAnalyzer) {
    plugins.push(getWebpackBundleAnalyzerPlugin(8889));
  }
  if (!isProduction) {
    plugins.push(new WatchExternalFilesPlugin({ files: ["./assets/*"] }));
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
              source: `${PATHS.FIREBASE_BUILD}/js/firebase.js`,
              destination: `${PATHS.EXTENSION}/js/`,
            },
            {
              source: `${PATHS.SRC}/scripts/service-worker.js`,
              destination: `${PATHS.EXTENSION}/`,
            },
          ],
        },
      },
    }),
    dllReferencePlugin,
    definePlugin,
    esLintPLugin,
  ];
  if (enableBundleAnalyzer) {
    plugins.push(getWebpackBundleAnalyzerPlugin(8890));
  }
  return plugins;
};

const backgroundConfig = {
  ...commonConfig,
  name: "BackgroundScript",
  entry: "./src/scripts/background.js",
  output: {
    path: `${PATHS.EXTENSION}/js/`,
    filename: "background.js",
  },
  target: "browserslist",
  plugins: getBackgroundConfigPlugins(),
};

const popupConfig = {
  ...commonConfig,
  name: "ContentScript",
  entry: "./src/popupIndex.js",
  output: {
    path: PATHS.EXTENSION,
    filename: "js/[name].[chunkhash:9].js",
    chunkFilename: "js/[name].[chunkhash:9].js",
    pathinfo: false,
  },
  target: "browserslist",
  optimization: {
    nodeEnv: ENV,
    minimize: isProduction,
    chunkIds: "named",
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]@material-ui[\\/]/,
          name: "material-ui",
          chunks: "all",
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: "react",
          chunks: "all",
        },
      },
    },
  },
  plugins: getPopupConfigPlugins(),
};

module.exports = [firebaseDllConfig, backgroundConfig, popupConfig];
