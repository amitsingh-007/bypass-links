import { type MantineThemeOverride } from '@mantine/core';

export const mantineTheme: MantineThemeOverride = {
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
    Switch: {
      defaultProps: {
        onLabel: 'ON',
        offLabel: 'OFF',
      },
    },
  },
};
