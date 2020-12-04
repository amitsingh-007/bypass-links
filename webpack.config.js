const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundleAnalyzerPlugin = require("@bundle-analyzer/webpack-plugin");
const WebpackBundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const FileManagerPlugin = require("filemanager-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const WebpackShellPluginNext = require("webpack-shell-plugin-next");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");
const { getExtensionFile } = require("./src/utils");
const { releaseDate, extVersion } = require("./release-config");

const ENV = process.env.NODE_ENV || "production";
const isProduction = ENV === "production";
const enableBundleAnalyzer = process.env.ENABLE_BUNDLE_ANLYZER === "true";

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

const terserConfig = {
  extractComments: false,
  parallel: true,
  terserOptions: {
    compress: {
      hoist_funs: true,
    },
    ecma: 6,
  },
};

const fileManagerPlugin = new FileManagerPlugin({
  events: {
    onStart: {
      copy: [
        {
          source: "./public-extension/*",
          destination: path.resolve(__dirname, "extension"),
        },
        {
          source: "./src/css/*",
          destination: path.resolve(__dirname, "extension"),
        },
      ],
    },
    onEnd: {
      archive: [
        {
          source: path.resolve(__dirname, "extension"),
          destination: `./build/${getExtensionFile(extVersion)}`,
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
    fileManagerPlugin,
    new webpack.ProgressPlugin(),
  ];
  if (enableBundleAnalyzer) {
    plugins.push(
      new WebpackBundleAnalyzerPlugin({
        openAnalyzer: true,
        generateStatsFile: true,
        statsFilename: "stats.json",
        defaultSizes: "gzip",
        analyzerPort: 8888,
      })
    );
  }
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
    new webpack.DefinePlugin({
      __EXT_VERSION__: JSON.stringify(extVersion),
      __RELEASE_DATE__: JSON.stringify(releaseDate),
    }),
    new webpack.ProgressPlugin(),
  ];
  if (!isProduction) {
    plugins.push(
      new WebpackShellPluginNext({
        onBuildEnd: {
          scripts: ["nodemon server/index.js --watch build"],
          blocking: false,
          parallel: true,
        },
      })
    );
  }
  return plugins;
};

const getBackgroundConfigPlugins = () => {
  const plugins = [
    new BundleAnalyzerPlugin({
      token: "9bc57954116cf0bd136f7718b24d79c4383ff15f",
    }),
    fileManagerPlugin,
    new webpack.ProgressPlugin(),
  ];
  if (enableBundleAnalyzer) {
    plugins.push(
      new WebpackBundleAnalyzerPlugin({
        openAnalyzer: true,
        generateStatsFile: true,
        statsFilename: "stats.json",
        defaultSizes: "gzip",
        analyzerPort: 8889,
      })
    );
  }
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
  optimization: {
    nodeEnv: ENV,
    minimize: isProduction,
    minimizer: [new TerserPlugin(terserConfig)],
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
  mode: ENV,
  resolve: preactConfig,
  plugins: getBackgroundConfigPlugins(),
  devtool: devToolsConfig,
  performance: {
    maxEntrypointSize: 500000,
    maxAssetSize: 500000,
  },
  optimization: {
    nodeEnv: ENV,
    minimize: isProduction,
    minimizer: [new TerserPlugin(terserConfig)],
  },
  stats: statsConfig,
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
  optimization: {
    nodeEnv: ENV,
    minimize: isProduction,
    minimizer: [new TerserPlugin(terserConfig)],
  },
  stats: statsConfig,
};

module.exports = [downloadPageConfig, backgroundConfig, popupConfig];
