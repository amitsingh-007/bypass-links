const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackShellPlugin = require("webpack-shell-plugin");

const ENV = process.env.NODE_ENV || "production";

const preactConfig = {
  alias: {
    react: "preact/compat",
    "react-dom": "preact/compat",
  },
};

const scriptsConfig = {
  entry: "./src/scripts/background.js",
  output: {
    path: path.resolve(__dirname, "extension"),
    filename: "background.js",
  },
  mode: ENV,
  resolve: preactConfig,
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "public-extension",
          to: path.resolve(__dirname, "extension"),
        },
        {
          from: "src/css",
          to: path.resolve(__dirname, "extension"),
        },
      ],
    }),
    new WebpackShellPlugin({
      onBuildEnd: ["node generate-release-config.js"],
    }),
  ],
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
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  mode: ENV,
  resolve: preactConfig,
  plugins: [
    new HtmlWebpackPlugin({ template: "./public-extension/index.html" }),
  ],
};

const handleErrors = (err, stats) => {
  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    return;
  }
  const info = stats.toJson();
  if (stats.hasErrors()) {
    console.error(info.errors);
  }
  if (stats.hasWarnings()) {
    console.warn(info.warnings);
  }
};

const onComplete = (err, stats) => {
  handleErrors(err, stats);
  //do something else
};

webpack([scriptsConfig, popupConfig], onComplete);
