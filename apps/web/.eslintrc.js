const config = require('@bypass/configs/eslint.base');

module.exports = {
  ...config,
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
};
