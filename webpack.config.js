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
const commonConfig = require("./webpack.common.config");
const removeDir = require("./remove-dir");

const ENV = process.env.NODE_ENV;
const isProduction = ENV === "production";
const enableBundleAnalyzer = process.env.ENABLE_BUNDLE_ANLYZER === "true";
const isDevServer = process.env.DEV_SERVER === "true";

const PATHS = {
  BUILD: path.resolve(__dirname, "build"),
  EXTENSION: path.resolve(__dirname, "extension"),
  SRC: path.resolve(__dirname, "src"),
};

const scssLoaders = {
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
};

const setProgressPlugin = (plugins) => {
  if (!isProduction) {
    plugins.push(new ProgressPlugin());
  }
};

const miniCssExtractPluginConfig = new MiniCssExtractPlugin({
  filename: `[name]${isProduction ? ".[contenthash]" : ""}.css`,
  chunkFilename: `[id]${isProduction ? ".[contenthash]" : ""}.css`,
});

const fileManagerPluginCommonConfig = {
  delete: [`./extension/{${enableBundleAnalyzer ? "" : "stats.json,"}*.txt}`],
  archive: [
    {
      source: PATHS.EXTENSION,
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
    new DefinePlugin({
      __EXT_VERSION__: JSON.stringify(extVersion),
      __RELEASE_DATE__: JSON.stringify(releaseDate),
      __PROD__: JSON.stringify(isProduction),
    }),
    new InjectManifest({
      swSrc: "./src/sw.js",
      swDest: "sw.js",
    }),
    miniCssExtractPluginConfig,
  ];
  if (enableBundleAnalyzer) {
    plugins.push(getWebpackBundleAnalyzerPlugin(8888));
  }
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
              destination: PATHS.EXTENSION,
            },
          ],
        },
        onEnd: fileManagerPluginCommonConfig,
      },
    }),
    miniCssExtractPluginConfig,
    definePlugin,
  ];
  if (enableBundleAnalyzer) {
    plugins.push(getWebpackBundleAnalyzerPlugin(8889));
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
    //To use common code, build `webpack.firebase.config.js` first, then current config in package.json
    // new DllReferencePlugin({
    //   name: "firebase_lib",
    //   manifest: path.resolve(__dirname, "./extension/firebase-manifest.json"),
    // }),
    definePlugin,
  ];
  if (enableBundleAnalyzer) {
    plugins.push(getWebpackBundleAnalyzerPlugin(8890));
  }
  setProgressPlugin(plugins);
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
      chunks: "all",
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
      scssLoaders,
    ],
  },
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
  plugins: getBackgroundConfigPlugins(),
};

const popupConfig = {
  ...commonConfig,
  entry: "./src/popupIndex.js",
  output: {
    path: PATHS.EXTENSION,
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
      scssLoaders,
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
  configs = [downloadPageConfig, ...configs];
} else if (isDevServer) {
  configs = [downloadPageConfig];
}

removeDir(PATHS.EXTENSION);

module.exports = configs;
