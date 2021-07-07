const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const ENV = process.env.NODE_ENV;
const isProduction = ENV === "production";

const PATHS = {
  ROOT: path.resolve(__dirname, ".."),
  EXTENSION: path.resolve(__dirname, "extension-build"),
  FIREBASE_BUILD: path.resolve(__dirname, "firebase-build"),
  SRC: path.resolve(__dirname, "src"),
};

const commonConfig = {
  mode: ENV,
  resolve: {
    extensions: [".js", ".scss"],
    alias: {
      "@common": path.resolve(__dirname, "..", "common/src/"),
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
      GlobalStyles: path.resolve(__dirname, "src/scss/"),
      GlobalUtils: path.resolve(__dirname, "src/utils/"),
      SrcPath: path.resolve(__dirname, "src/"),
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
    minimizer: ["...", new CssMinimizerPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.svg$/,
        use: ["@svgr/webpack"],
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
