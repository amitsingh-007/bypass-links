const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const { DefinePlugin } = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");

const ENV = process.env.NODE_ENV;
const isProduction = ENV === "production";
const hostName = process.env.HOST_NAME;

const PATHS = {
  ROOT: path.resolve(__dirname),
  EXTENSION: path.resolve(__dirname, "extension-build"),
  FIREBASE: path.resolve(__dirname, "firebase-dll"),
  SRC: path.resolve(__dirname, "src"),
};

const tsConfigFile = `${PATHS.ROOT}/${
  isProduction ? "tsconfig.production.json" : "tsconfig.json"
}`;

const babelLoaderOpts = {
  cacheDirectory: true,
};

const commonConfig = {
  mode: ENV,
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".scss"],
    modules: [PATHS.SRC, "node_modules"],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: tsConfigFile,
        extensions: [".ts", ".tsx", ".js", ".scss"],
      }),
    ],
  },
  stats: isProduction ? "normal" : "errors-warnings",
  devtool: isProduction ? undefined : "inline-source-map",
  target: "browserslist",
  performance: {
    hints: false,
  },
  optimization: {
    nodeEnv: ENV,
    chunkIds: "named",
    minimize: isProduction,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new CssMinimizerPlugin(),
    ],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: tsConfigFile,
              transpileOnly: true,
            },
          },
          {
            loader: "babel-loader",
            options: babelLoaderOpts,
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: babelLoaderOpts,
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
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: tsConfigFile,
      },
      eslint: {
        files: "./src/**/*.{js,ts,tsx}",
        options: {
          cache: true,
        },
      },
    }),
    new DefinePlugin({
      __PROD__: JSON.stringify(isProduction),
      HOST_NAME: JSON.stringify(hostName),
    }),
  ],
};

module.exports = {
  commonConfig,
  PATHS: PATHS,
};
