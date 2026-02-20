import { type MantineThemeOverride } from '@mantine/core';

export const mantineTheme: MantineThemeOverride = {
  fontFamily: 'Manrope, sans-serif',
  headings: {
    fontFamily: 'Manrope, sans-serif',
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
