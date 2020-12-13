const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const FileManagerPlugin = require("filemanager-webpack-plugin");
const { InjectManifest } = require("workbox-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const { DefinePlugin, ProgressPlugin } = require("webpack");
const { getExtensionFile } = require("./src/utils");
const { releaseDate, extVersion } = require("./release-config");

const ENV = process.env.NODE_ENV;
const isProduction = ENV === "production";
const enableBundleAnalyzer = process.env.ENABLE_BUNDLE_ANLYZER === "true";
const isDevServer = process.env.DEV_SERVER === "true";

const commonConfig = {
  mode: ENV,
  resolve: {
    extensions: [".js", ".scss"],
    alias: {
      ChromeApi: path.resolve(__dirname, "src/scripts/chrome/"),
      GlobalActionCreators: path.resolve(__dirname, "src/actionCreators/"),
      GlobalActionTypes: path.resolve(__dirname, "src/actionTypes/"),
      GlobalApis: path.resolve(__dirname, "src/apis/"),
      GlobalComponents: path.resolve(__dirname, "src/components/"),
      GlobalConstants: path.resolve(__dirname, "src/constants/"),
      GlobalContainers: path.resolve(__dirname, "src/containers/"),
      GlobalIcons: path.resolve(__dirname, "src/icons/"),
      GlobalReducers: path.resolve(__dirname, "src/reducers/"),
      GlobalScripts: path.resolve(__dirname, "src/scripts/"),
      GlobalStyles: path.resolve(__dirname, "src/styles/"),
      GlobalUtils: path.resolve(__dirname, "src/utils/"),
      SrcPath: path.resolve(__dirname, "src/"),
      react: "preact/compat",
      "react-dom": "preact/compat",
    },
    modules: [path.resolve(__dirname, "..", "src"), "node_modules"],
  },
  stats: isProduction ? "normal" : "errors-warnings",
  devtool: isProduction ? undefined : "eval-cheap-module-source-map",
  performance: {
    maxEntrypointSize: 500000,
    maxAssetSize: 500000,
  },
  optimization: {
    nodeEnv: ENV,
    minimize: isProduction,
  },
  watchOptions: {
    ignored: "node_modules/**",
  },
};

const setProgressPlugin = (plugins) => {
  if (!isProduction) {
    plugins.push(new ProgressPlugin());
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
  new BundleAnalyzerPlugin({
    openAnalyzer: true,
    generateStatsFile: true,
    statsFilename: "stats.json",
    defaultSizes: "gzip",
    analyzerPort: port,
  });

const definePlugin = new DefinePlugin({
  __PROD__: JSON.stringify(isProduction),
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
      },
    }),
    new DefinePlugin({
      __EXT_VERSION__: JSON.stringify(extVersion),
      __RELEASE_DATE__: JSON.stringify(releaseDate),
    }),
    new InjectManifest({
      swSrc: "./src/sw.js",
      swDest: "sw.js",
    }),
  ];
  setProgressPlugin(plugins);
  return plugins;
};

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
    new MiniCssExtractPlugin({
      filename: `[name]${isProduction ? ".[contenthash]" : ""}.css`,
      chunkFilename: `[id]${isProduction ? ".[contenthash]" : ""}.css`,
    }),
    definePlugin,
  ];
  if (enableBundleAnalyzer) {
    plugins.push(getWebpackBundleAnalyzerPlugin(8888));
  }
  if (isProduction) {
    plugins.push(new OptimizeCssAssetsPlugin({}));
  }
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
    definePlugin,
  ];
  if (enableBundleAnalyzer) {
    plugins.push(getWebpackBundleAnalyzerPlugin(8889));
  }
  setProgressPlugin(plugins);
  return plugins;
};

const downloadPageConfig = {
  ...commonConfig,
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
    stats: "errors-warnings",
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
        test: /\.(svg)$/i,
        loader: "file-loader",
        options: {
          name: "[name]-[contenthash].[ext]",
        },
      },
    ],
  },
  plugins: getDownloadPageConfigPlugins(),
  devtool: "source-map",
};

const backgroundConfig = {
  ...commonConfig,
  entry: "./src/scripts/background.js",
  output: {
    path: path.resolve(__dirname, "extension"),
    filename: "background.js",
  },
  target: "browserslist",
  plugins: getBackgroundConfigPlugins(),
};

const popupConfig = {
  ...commonConfig,
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
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              sourceMap: !isProduction,
            },
          },
        ],
      },
    ],
  },
  plugins: getPopupConfigPlugins(),
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
