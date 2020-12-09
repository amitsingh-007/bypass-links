const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackBundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const FileManagerPlugin = require("filemanager-webpack-plugin");
const webpack = require("webpack");
const { getExtensionFile } = require("./src/utils");
const { releaseDate, extVersion } = require("./release-config");

const ENV = process.env.NODE_ENV || "production";
const isProduction = ENV === "production";
const enableBundleAnalyzer = process.env.ENABLE_BUNDLE_ANLYZER === "true";
const isDevServer = process.env.DEV_SERVER === "true";

const preactConfig = {
  alias: {
    react: "preact/compat",
    "react-dom": "preact/compat",
  },
};

const devToolsConfig = isProduction
  ? undefined
  : "eval-cheap-module-source-map";

const statsConfig = isProduction ? "normal" : "errors-warnings";

const performanceConfig = {
  maxEntrypointSize: 500000,
  maxAssetSize: 500000,
};

const setProgressPlugin = (plugins) => {
  if (!isProduction) {
    plugins.push(new webpack.ProgressPlugin());
  }
};

const fileManagerPluginCommonConfig = {
  delete: [`./extension/{${enableBundleAnalyzer ? "" : "stats.json,"}*.txt}`],
  archive: [
    {
      source: path.resolve(__dirname, "extension"),
      destination: `./build/${getExtensionFile(extVersion)}`,
    },
  ],
};

const getWebpackBundleAnalyzerPlugin = (port) =>
  new WebpackBundleAnalyzerPlugin({
    openAnalyzer: true,
    generateStatsFile: true,
    statsFilename: "stats.json",
    defaultSizes: "gzip",
    analyzerPort: port,
  });

const getPopupConfigPlugins = () => {
  const plugins = [
    new HtmlWebpackPlugin({
      template: "./assets/index.html",
      cache: false,
    }),
    new FileManagerPlugin({
      events: {
        onStart: {
          copy: [
            {
              source: "./assets/*",
              destination: path.resolve(__dirname, "extension"),
            },
          ],
        },
        onEnd: fileManagerPluginCommonConfig,
      },
    }),
  ];
  if (enableBundleAnalyzer) {
    plugins.push(getWebpackBundleAnalyzerPlugin(8888));
  }
  setProgressPlugin(plugins);
  return plugins;
};

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
      },
    }),
    new webpack.DefinePlugin({
      __EXT_VERSION__: JSON.stringify(extVersion),
      __RELEASE_DATE__: JSON.stringify(releaseDate),
    }),
  ];
  setProgressPlugin(plugins);
  return plugins;
};

const getBackgroundConfigPlugins = () => {
  const plugins = [
    new FileManagerPlugin({
      events: {
        onEnd: fileManagerPluginCommonConfig,
      },
    }),
  ];
  if (enableBundleAnalyzer) {
    plugins.push(getWebpackBundleAnalyzerPlugin(8889));
  }
  setProgressPlugin(plugins);
  return plugins;
};

const downloadPageConfig = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "js/[name].[chunkhash:9].js",
    chunkFilename: "js/[name].[chunkhash:9].js",
    pathinfo: false,
  },
  //Due to bug in WebpackV5: https://github.com/webpack/webpack-dev-server/issues/2758
  target: isProduction ? "browserslist" : "web",
  devServer: {
    contentBase: "./build",
    compress: true,
    port: 5000,
    open: true,
    stats: statsConfig,
    watchContentBase: true,
  },
  optimization: {
    nodeEnv: ENV,
    minimize: isProduction,
    chunkIds: "named",
    splitChunks: {
      automaticNameDelimiter: "~",
      chunks: "all",
      minSize: 50000,
      maxSize: 70000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]@material-ui[\\/]/,
          name: "material-ui",
          chunks: "all",
        },
      },
    },
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
  devtool: "source-map",
  stats: statsConfig,
};

const backgroundConfig = {
  entry: "./src/scripts/background.js",
  output: {
    path: path.resolve(__dirname, "extension"),
    filename: "background.js",
  },
  target: "browserslist",
  mode: ENV,
  resolve: preactConfig,
  plugins: getBackgroundConfigPlugins(),
  devtool: devToolsConfig,
  performance: performanceConfig,
  optimization: {
    nodeEnv: ENV,
    minimize: isProduction,
  },
  stats: statsConfig,
};

const popupConfig = {
  entry: "./src/popupIndex.js",
  output: {
    path: path.resolve(__dirname, "extension"),
    filename: "popup.js",
  },
  target: "browserslist",
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
  performance: performanceConfig,
  optimization: {
    nodeEnv: ENV,
    minimize: isProduction,
  },
  stats: statsConfig,
};

/**
 * For production, build all 3 configs
 * For dev-server, only build downloadPageConfig
 * Else, build extension related configs
 */
let configs = [backgroundConfig, popupConfig];
if (isProduction) {
  configs = [downloadPageConfig, backgroundConfig, popupConfig];
} else if (isDevServer) {
  configs = [downloadPageConfig];
}

module.exports = configs;
