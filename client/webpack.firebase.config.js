const FileManagerPlugin = require("filemanager-webpack-plugin");
const { DllPlugin, DefinePlugin } = require("webpack");
const { commonConfig, PATHS } = require("./webpack.common.config");

const ENV = process.env.NODE_ENV;
const isProduction = ENV === "production";
const hostName = process.env.HOST_NAME || "https://bypass-links.netlify.app";

const firebasedDllConfig = {
  ...commonConfig,
  name: "Firebase",
  target: "browserslist",
  entry: ["./src/utils/firebase.js"],
  output: {
    filename: "firebase.js",
    path: PATHS.FIREBASE_BUILD,
    library: "firebase_lib",
  },
  plugins: [
    new DllPlugin({
      name: "firebase_lib",
      path: `${PATHS.FIREBASE_BUILD}/firebase-manifest.json`,
    }),
    new FileManagerPlugin({
      events: {
        onStart: {
          delete: ["./extension/*"],
        },
      },
    }),
    new DefinePlugin({
      __PROD__: JSON.stringify(isProduction),
      HOST_NAME: JSON.stringify(hostName),
    }),
  ],
};

/**
 * This will generate a common chunk for background and content scripts
 * This will be referenced using DllReferencePlugin
 */
module.exports = firebasedDllConfig;
