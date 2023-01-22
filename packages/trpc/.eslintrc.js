const config = require('@bypass/configs/eslint.base');

module.exports = {
  ...config,
  root: true,
  parserOptions: {
    ...config.parserOptions,
    tsconfigRootDir: __dirname,
  },
};
