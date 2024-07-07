const config = require('@bypass/configs/eslint.base.cjs');

module.exports = {
  ...config,
  root: true,
  parserOptions: {
    ...config.parserOptions,
    tsconfigRootDir: __dirname,
  },
};
