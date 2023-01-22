const config = require('@bypass/configs/eslint.base');

module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'airbnb',
    'airbnb-typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'next',
    'next/core-web-vitals',
  ],
  env: {
    ...config.env,
    commonjs: true,
  },
  parserOptions: {
    ...config.parserOptions,
    tsconfigRootDir: __dirname,
  },
  plugins: config.plugins,
  settings: config.settings,
  rules: config.rules,
  overrides: config.overrides,
};
