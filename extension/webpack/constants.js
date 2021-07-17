const path = require("path");

const PATHS = {
  ROOT: path.resolve(__dirname, ".."),
  EXTENSION: path.resolve(__dirname, "..", "extension-build"),
  FIREBASE: path.resolve(__dirname, "..", "firebase-dll"),
  SRC: path.resolve(__dirname, "..", "src"),
};

module.exports = {
  PATHS,
};
