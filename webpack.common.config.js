const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const ENV = process.env.NODE_ENV;
const isProduction = ENV === "production";

const PATHS = {
  BUILD: path.resolve(__dirname, "build"),
  EXTENSION: path.resolve(__dirname, "extension"),
  FIREBASE_BUILD: path.resolve(__dirname, "firebase-build"),
  SRC: path.resolve(__dirname, "src"),
};

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
