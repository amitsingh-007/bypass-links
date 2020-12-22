const FileManagerPlugin = require("filemanager-webpack-plugin");
const { DllPlugin } = require("webpack");
const { commonConfig, PATHS } = require("./webpack.common.config");

const firebasedDllConfig = {
  ...commonConfig,
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
  ],
};

/**
 * This will generate a common chunk for background and content scripts
 * This will be referenced usinf DllReferencePlugin
 */
module.exports = firebasedDllConfig;
