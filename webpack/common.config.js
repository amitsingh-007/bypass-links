const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const modernBabelConfig = require("../babel/modern.config");

const ENV = process.env.NODE_ENV;
const isProduction = ENV === "production";

const resolvePath = (fsPath) => path.resolve(__dirname, "..", fsPath);

const PATHS = {
  BUILD: resolvePath("build"),
  EXTENSION: resolvePath("extension"),
  FIREBASE_BUILD: resolvePath("firebase-build"),
  SRC: resolvePath("src"),
};

const commonConfig = {
  context: resolvePath(""),
  mode: ENV,
  resolve: {
    extensions: [".js", ".scss"],
    alias: {
      ChromeApi: resolvePath("src/scripts/chrome/"),
      GlobalActionCreators: resolvePath("src/actionCreators/"),
      GlobalActionTypes: resolvePath("src/actionTypes/"),
      GlobalApis: resolvePath("src/apis/"),
      GlobalComponents: resolvePath("src/components/"),
      GlobalConstants: resolvePath("src/constants/"),
      GlobalContainers: resolvePath("src/containers/"),
      GlobalIcons: resolvePath("src/icons/"),
      GlobalReducers: resolvePath("src/reducers/"),
      GlobalScripts: resolvePath("src/scripts/"),
      GlobalStyles: resolvePath("src/styles/"),
      GlobalUtils: resolvePath("src/utils/"),
      SrcPath: resolvePath("src/"),
      /**
       * preact caused issue with material-ui makeStyles hook(not in our code, instead in the internal code of mui)
       * Refer: https://github.com/mui-org/material-ui/issues/20182#issuecomment-700800996
       * Issue happended inside `FolderDropdown` component
       */
      // react: "preact/compat",
      // "react-dom": "preact/compat",
    },
    modules: [PATHS.SRC, "node_modules"],
  },
  stats: isProduction ? "normal" : "errors-warnings",
  devtool: isProduction ? undefined : "inline-source-map",
  performance: {
    hints: false,
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
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: "react",
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
          options: {
            ...modernBabelConfig(),
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.(svg)$/i,
        loader: "file-loader",
        options: {
          name: "[name]-[contenthash].[ext]",
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
  watchOptions: {
    ignored: "node_modules/**",
  },
};

module.exports = {
  commonConfig: commonConfig,
  PATHS: PATHS,
};
