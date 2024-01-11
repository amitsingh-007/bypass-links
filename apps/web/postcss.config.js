const postcssConfig = require('@bypass/configs/postcss.base');

module.exports = {
  ...postcssConfig,
  plugins: {
    ...postcssConfig.plugins,
    autoprefixer: {},
  },
};
