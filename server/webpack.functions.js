const Dotenv = require("dotenv-webpack");
var nodeExternals = require("webpack-node-externals");
const FileManagerPlugin = require("filemanager-webpack-plugin");

const isProduction = process.env.NODE_ENV === "production";

const getPlugins = () => {
  const plugins = [];
  if (!isProduction) {
    plugins.push(new Dotenv());
  } else {
    plugins.push(
      new FileManagerPlugin({
        events: {
          onEnd: {
            delete: ["./functions/webpack.functions.js"],
          },
        },
      })
    );
  }
  return plugins;
};

module.exports = {
  target: "node",
  plugins: getPlugins(),
  externals: [nodeExternals()],
  optimization: { minimize: false },
};
