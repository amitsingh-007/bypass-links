const config = require('@bypass/configs/eslint.base');

module.exports = {
  ...config,
  root: true,
  // We have vitest instead of plywright in this package
  extends: config.extends.filter(
    (plugin) => plugin !== 'plugin:playwright/playwright-test'
  ),
  parserOptions: {
    ...config.parserOptions,
    tsconfigRootDir: __dirname,
  },
};
