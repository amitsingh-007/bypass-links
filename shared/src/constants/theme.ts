import { MantineThemeOverride } from '@mantine/core';

export const mantineTheme: MantineThemeOverride = {
  colorScheme: 'dark',
  fontFamily: 'Product Sans',
  cursorType: 'pointer',
  loader: 'bars',
  components: {
    TextInput: {
      defaultProps: {
        autoComplete: 'off',
      },
    },
  },
};
