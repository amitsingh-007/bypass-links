const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackShellPlugin = require("webpack-shell-plugin");
const BundleAnalyzerPlugin = require("@bundle-analyzer/webpack-plugin");

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
    new BundleAnalyzerPlugin({
      token: "9bc57954116cf0bd136f7718b24d79c4383ff15f",
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
    new BundleAnalyzerPlugin({
      token: "9bc57954116cf0bd136f7718b24d79c4383ff15f",
    }),
  ],
};

module.exports = [scriptsConfig, popupConfig];
