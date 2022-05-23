/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

const PATHS = {
  COMMON: path.resolve(__dirname, '..', '..', 'common'),
  EXTENSION: path.resolve(__dirname, '..', 'extension-build'),
  FIREBASE: path.resolve(__dirname, '..', 'firebase-dll'),
  SRC: path.resolve(__dirname, '..', 'src'),
  ROOT: path.resolve(__dirname, '..'),
};

module.exports = {
  PATHS,
};
