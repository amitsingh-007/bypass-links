const config = require('@bypass/configs/eslint.base');

module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    'airbnb',
    'airbnb-typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'next',
  ],
  env: {
    ...config.env,
    commonjs: true,
  },
  parser: config.parser,
  parserOptions: {
    ...config.parserOptions,
    tsconfigRootDir: __dirname,
  },
  plugins: config.plugins,
  settings: config.settings,
  ignorePatterns: config.ignorePatterns,
  rules: config.rules,
  overrides: config.overrides,
};
