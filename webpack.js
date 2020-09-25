const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

webpack(
  {
    entry: "./src/scripts/background.js",
    output: {
      path: path.resolve(__dirname, "extension"),
      filename: "background.js",
    },
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
  },
  (err, stats) => {
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
  }
);
