import basePostcssConfig from '@bypass/configs/postcss.base.mjs';

const postcssConfig = {
  ...basePostcssConfig,
  plugins: {
    ...basePostcssConfig.plugins,
    autoprefixer: {},
  },
};

export default postcssConfig;
