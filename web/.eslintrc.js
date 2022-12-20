const config = require('@bypass/shared/config/eslint.base.js');

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
  parserOptions: config.parserOptions,
  rules: config.rules,
  overrides: config.overrides,
};
