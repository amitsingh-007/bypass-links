const config = require('../packages/shared/config/.eslintrc.js');

module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'next',
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    ...config.env,
    commonjs: true,
  },
  plugins: config.plugins,
  settings: config.settings,
  parserOptions: config.parserOptions,
  rules: config.rules,
  overrides: config.overrides,
};
