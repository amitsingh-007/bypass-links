import { MantineThemeOverride } from '@mantine/core';

export const mantineTheme: MantineThemeOverride = {
  colorScheme: 'dark',
  fontFamily: 'Google Sans',
  headings: {
    fontFamily: 'Google Sans',
  },
  cursorType: 'pointer',
  loader: 'bars',
  globalStyles: () => ({
    '::-webkit-scrollbar': { width: '11px' },
  }),
  components: {
    TextInput: {
      defaultProps: {
        autoComplete: 'off',
      },
    },
    Modal: {
      defaultProps: {
        withFocusReturn: true,
        zIndex: 1002, //1 more than Header's zIndex
      },
    },
  },
};
