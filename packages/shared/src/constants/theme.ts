import { MantineThemeOverride } from '@mantine/core';

export const mantineTheme: MantineThemeOverride = {
  colorScheme: 'dark',
  fontFamily: 'Google Sans',
  headings: {
    fontFamily: 'Google Sans',
  },
  cursorType: 'pointer',
  loader: 'bars',
  dateFormat: 'DD MMM YYYY',
  globalStyles: (theme) => ({
    '::-webkit-scrollbar': {
      width: theme.spacing.sm,
      backgroundColor: theme.colors.dark[6],
    },
    '::-webkit-scrollbar-thumb': {
      backgroundColor: theme.colors.dark[3],
      borderWidth: 3,
      borderStyle: 'solid',
      borderColor: theme.colors.dark[6],
      borderRadius: theme.radius.md,
    },
    '::-webkit-scrollbar-track': {
      borderRadius: 10,
      backgroundColor: theme.colors.dark[6],
    },
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
