const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const ENV = process.env.NODE_ENV || "production";

const config = {
  entry: "./src/scripts/background.js",
  output: {
    path: path.resolve(__dirname, "extension"),
    filename: "background.js",
  },
  mode: ENV,
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "public-extension",
          to: path.resolve(__dirname, "extension"),
        },
      ],
    }),
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

webpack(config, onComplete);
