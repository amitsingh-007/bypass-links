const path = require("path");

const ENV = process.env.NODE_ENV;
const isProduction = ENV === "production";

const commonConfig = {
  mode: ENV,
  resolve: {
    extensions: [".js", ".scss"],
    alias: {
      ChromeApi: path.resolve(__dirname, "src/scripts/chrome/"),
      GlobalActionCreators: path.resolve(__dirname, "src/actionCreators/"),
      GlobalActionTypes: path.resolve(__dirname, "src/actionTypes/"),
      GlobalApis: path.resolve(__dirname, "src/apis/"),
      GlobalComponents: path.resolve(__dirname, "src/components/"),
      GlobalConstants: path.resolve(__dirname, "src/constants/"),
      GlobalContainers: path.resolve(__dirname, "src/containers/"),
      GlobalIcons: path.resolve(__dirname, "src/icons/"),
      GlobalReducers: path.resolve(__dirname, "src/reducers/"),
      GlobalScripts: path.resolve(__dirname, "src/scripts/"),
      GlobalStyles: path.resolve(__dirname, "src/styles/"),
      GlobalUtils: path.resolve(__dirname, "src/utils/"),
      SrcPath: path.resolve(__dirname, "src/"),
      react: "preact/compat",
      "react-dom": "preact/compat",
    },
    modules: [path.resolve(__dirname, "src"), "node_modules"],
  },
  stats: isProduction ? "normal" : "errors-warnings",
  devtool: isProduction ? undefined : "eval-cheap-module-source-map",
  performance: {
    hints: false,
  },
  optimization: {
    nodeEnv: ENV,
    minimize: isProduction,
  },
  watchOptions: {
    ignored: "node_modules/**",
  },
};

module.exports = commonConfig;
