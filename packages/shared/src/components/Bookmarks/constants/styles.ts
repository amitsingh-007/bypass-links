import { Sx } from '@mantine/core';

export const bookmarkRowStyles: Sx = (theme) => ({
  boxSizing: 'border-box',
  borderRadius: theme.radius.md,
  '&:hover': {
    backgroundColor: theme.colors.gray[8],
  },
  '&[data-is-selected="true"]': {
    border: `${theme.colors.violet[4]} 1px solid`,
    backgroundColor: theme.colors.violet[9],
    borderRadius: theme.radius.md,
    '&:hover': {
      backgroundColor: theme.colors.violet[7],
    },
  },
  '&[data-is-dragging="true"]': {
    backgroundColor: theme.colors.violet[9],
    border: `${theme.colors.violet[4]} 1px solid`,
  },
});
