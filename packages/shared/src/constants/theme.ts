import { createTheme } from '@mantine/core';

export const mantineTheme = createTheme({
  fontFamily: 'Google Sans',
  headings: {
    fontFamily: 'Google Sans',
  },
  cursorType: 'pointer',
  components: {
    TextInput: {
      defaultProps: {
        autoComplete: 'off',
      },
    },
    Modal: {
      defaultProps: {
        returnFocus: true,
      },
    },
    Button: {
      defaultProps: {
        variant: 'light',
      },
    },
    ActionIcon: {
      defaultProps: {
        variant: 'subtle',
      },
    },
  },
});
