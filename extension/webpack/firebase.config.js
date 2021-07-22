/**
 * This will generate a common chunk for background and content scripts
 */
const { merge } = require("webpack-merge");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { DllPlugin } = require("webpack");
const commonConfig = require("./common.config");
const { PATHS } = require("./constants");

const firebaseDllConfig = merge(commonConfig, {
  name: "firebase-dll",
  entry: ["./src/helpers/firebase.ts"],
  output: {
    filename: "js/firebase.dll.js",
    path: PATHS.EXTENSION,
    library: "firebase_lib",
  },
  plugins: [
    new DllPlugin({
      name: "firebase_lib",
      path: `${PATHS.FIREBASE}/manifest.json`,
    }),
    new CleanWebpackPlugin(),
  ],
});

module.exports = firebaseDllConfig;
