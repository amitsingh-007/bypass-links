import postcssConfig from '@bypass/configs/postcss.base.mjs';

export default {
  ...postcssConfig,
  plugins: {
    ...postcssConfig.plugins,
    autoprefixer: {},
  },
};
