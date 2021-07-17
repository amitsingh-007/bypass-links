/**
 * This will generate a common chunk for background and content scripts
 */
const { merge } = require("webpack-merge");
const FileManagerPlugin = require("filemanager-webpack-plugin");
const { DllPlugin } = require("webpack");
const commonConfig = require("./common.config");
const { PATHS } = require("./constants");

const firebaseDllConfig = merge(commonConfig, {
  name: "firebase-dll",
  entry: ["./src/utils/firebase.ts"],
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
    new FileManagerPlugin({
      events: {
        onStart: {
          delete: ["./extension-build/*", "./firebase-dll/*"],
        },
      },
    }),
  ],
});

module.exports = firebaseDllConfig;
