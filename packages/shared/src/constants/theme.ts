import { type MantineThemeOverride } from '@mantine/core';

export const mantineTheme: MantineThemeOverride = {
  fontFamily: 'Google Sans, sans-serif',
  headings: {
    fontFamily: 'Google Sans, sans-serif',
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
