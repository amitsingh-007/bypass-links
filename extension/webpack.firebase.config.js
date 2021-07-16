/**
 * This will generate a common chunk for background and content scripts
 * This will be referenced using DllReferencePlugin
 */
const { merge } = require("webpack-merge");
const FileManagerPlugin = require("filemanager-webpack-plugin");
const { DllPlugin, DefinePlugin } = require("webpack");
const { commonConfig, PATHS } = require("./webpack.common.config");

const ENV = process.env.NODE_ENV;
const isProduction = ENV === "production";
const hostName = process.env.HOST_NAME;

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
          delete: ["./extension-build/*"],
        },
      },
    }),
    new DefinePlugin({
      __PROD__: JSON.stringify(isProduction),
      HOST_NAME: JSON.stringify(hostName),
    }),
  ],
});

module.exports = firebaseDllConfig;
