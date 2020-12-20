const path = require("path");
const { DllPlugin } = require("webpack");
const commonConfig = require("./webpack.common.config");
const removeDir = require("./remove-dir");

removeDir("extension");

const firebasedDllConfig = {
  ...commonConfig,
  target: "browserslist",
  entry: ["./src/utils/firebase.js"],
  output: {
    filename: "firebase.js",
    path: path.resolve(__dirname, "extension"),
    library: "firebase_lib",
  },
  plugins: [
    new DllPlugin({
      name: "firebase_lib",
      path: path.resolve(__dirname, "./extension/firebase-manifest.json"),
    }),
  ],
};

/**
 * This will generate a common chunk for background and content scripts
 * This will be referenced usinf DllReferencePlugin
 */

module.exports = [firebasedDllConfig];
