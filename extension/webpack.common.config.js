const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

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
    extensions: [".ts", ".tsx", ".js", ".scss"],
    modules: [PATHS.SRC, "node_modules"],
    plugins: [
      new TsconfigPathsPlugin({
        extensions: [".ts", ".tsx", ".js", ".scss"],
      }),
    ],
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
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
          },
        },
      },
      {
        test: /\.js$/,
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
