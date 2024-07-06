import config from '@bypass/configs/eslint.base.js';

// const config = require('@bypass/configs/eslint.base.js');

export default {
  ...config,
  root: true,
  parserOptions: {
    ...config.parserOptions,
    tsconfigRootDir: __dirname,
  },
};

// module.exports = {
//   ...config,
//   root: true,
//   parserOptions: {
//     ...config.parserOptions,
//     tsconfigRootDir: __dirname,
//   },
// };
